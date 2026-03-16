const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const { authRequired, COOKIE_NAME } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  path: "/"
};

const RegisterSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre"),
  displayName: z.string().max(100).optional().default("")
});

const LoginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis")
});

/**
 * POST /api/auth/register
 * Crée un compte. Retourne l'utilisateur (sans mot de passe) et définit le cookie JWT.
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = RegisterSchema.parse(req.body);
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cette adresse e-mail." });
    }
    const hashed_password = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      hashed_password,
      displayName: (displayName || "").trim()
    });
    const userId = user._id.toString();
    if (JWT_SECRET) {
      const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    }
    res.status(201).json({
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName || "",
        posture_history: user.posture_history || []
      }
    });
  } catch (err) {
    if (err.name === "ZodError") {
      const msg = err.errors?.[0]?.message || "Données invalides";
      return res.status(400).json({ error: msg });
    }
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

/**
 * POST /api/auth/login
 * Authentification. Retourne l'utilisateur et définit le cookie JWT HttpOnly.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
    }
    const userId = user._id.toString();
    if (JWT_SECRET) {
      const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    }
    res.json({
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName || "",
        posture_history: user.posture_history || []
      }
    });
  } catch (err) {
    if (err.name === "ZodError") {
      const msg = err.errors?.[0]?.message || "Données invalides";
      return res.status(400).json({ error: msg });
    }
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

/**
 * POST /api/auth/logout
 * Supprime le cookie JWT.
 */
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur connecté (nécessite un JWT valide).
 */
router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-hashed_password")
      .lean();
    if (!user) {
      res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax" });
      return res.status(401).json({ error: "Utilisateur introuvable." });
    }
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName || "",
        posture_history: user.posture_history || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server Error" });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Supprime le compte utilisateur courant et les analyses associées.
 */
router.delete("/delete-account", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    await Analysis.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unable to delete account." });
  }
});

module.exports = router;
