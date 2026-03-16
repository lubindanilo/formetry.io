const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");
const Analysis = require("../models/Analysis");
const User = require("../models/User");
const { classifyPose, scoreTechnique } = require("../scoring");
const { putJson } = require("../s3");
const { getTopImprovements } = require("../feedback");
const { getScoreLabel } = require("../lib/scoreLabel");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const LandmarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional().default(0),
  visibility: z.number().min(0).max(1).optional().default(0)
});

const ClassifySchema = z.object({
  analysisId: z.string().min(1),
  userId: z.string().min(1),
  s3KeyImage: z.string().min(1),
  landmarks: z.array(LandmarkSchema).length(33),
  meta: z.record(z.string()).optional()
});

router.post("/classify", async (req, res) => {
  try {
    const body = ClassifySchema.parse(req.body);
    const userId = req.user?.id ?? body.userId;
    const { analysisId, s3KeyImage, landmarks, meta } = body;

    const scoring = await classifyPose({
      landmarks,
      saveSample: false,
      userLabel: null,
      meta: { ...meta, userId, analysisId, mode: "image" },
      includeDebug: true
    });

    const s3KeyResult = `users/${userId}/poses/${analysisId}/result.json`;

    const resultObj = {
      analysisId,
      userId,
      createdAt: new Date().toISOString(),
      s3KeyImage,
      predictedPose: scoring.pose,
      confidence: scoring.confidence,
      scores: scoring.scores || null,
      warnings: scoring.warnings || [],
      userLabel: ""
    };

    await putJson({ bucket: process.env.S3_BUCKET, key: s3KeyResult, obj: resultObj });

    await Analysis.updateOne(
      { analysisId },
      { $set: { analysisId, userId, s3KeyImage, s3KeyResult, predictedPose: scoring.pose, confidence: scoring.confidence, scores: scoring.scores || {}, landmarks } },
      { upsert: true }
    );

    res.json({
      analysisId,
      pose: scoring.pose,
      confidence: scoring.confidence,
      scores: scoring.scores || null,
      warnings: scoring.warnings || [],
      s3KeyImage,
      s3KeyResult
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

const ConfirmSchema = z.object({
  analysisId: z.string().min(1),
  userId: z.string().min(1),
  userLabel: z.string().min(1),
  // Langue souhaitée pour les feedbacks d'amélioration (ex. "fr", "en-US").
  lang: z.string().min(2).max(10).optional()
});

router.post("/confirm", async (req, res) => {
  try {
    const body = ConfirmSchema.parse(req.body);
    const userId = req.user?.id ?? body.userId;
    const { analysisId, userLabel, lang } = body;

    const analysis = await Analysis.findOne({ analysisId, userId }).lean();
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });
    if (!analysis.landmarks || analysis.landmarks.length !== 33) {
      return res.status(400).json({ error: "Missing landmarks for this analysis" });
    }

    const s3KeyResult =
      analysis.s3KeyResult || `users/${userId}/poses/${analysisId}/result.json`;

    const scoring = await classifyPose({
      landmarks: analysis.landmarks,
      saveSample: true,
      userLabel,
      meta: { userId, analysisId, mode: "image_confirm" },
      includeDebug: true
    });

    await Analysis.updateOne({ analysisId, userId }, { $set: { userLabel } });

    const updatedResultObj = {
      analysisId,
      userId,
      createdAt: analysis.createdAt ? new Date(analysis.createdAt).toISOString() : new Date().toISOString(),
      s3KeyImage: analysis.s3KeyImage,
      predictedPose: analysis.predictedPose,
      confidence: analysis.confidence,
      scores: analysis.scores || null,
      warnings: [],
      userLabel,
      datasetSampleId: scoring.sample_id || null
    };

    await putJson({ bucket: process.env.S3_BUCKET, key: s3KeyResult, obj: updatedResultObj });

    let techniqueScore = null;
    try {
      techniqueScore = await scoreTechnique({
        figure: userLabel,
        landmarks: analysis.landmarks
      });
      if (techniqueScore?.dimensions) {
        techniqueScore.improvements = getTopImprovements(
          techniqueScore.dimensions,
          techniqueScore.figure ?? userLabel,
          { limit: 3, lang }
        );
      }
    } catch (scoreErr) {
      console.error("Error while calling scoring service in /api/pose/confirm:", scoreErr);
      techniqueScore = null;
    }

    if (techniqueScore?.scores) {
      const scores = techniqueScore.scores;
      const globalScore = typeof scores.global === "number" ? scores.global : null;
      await Analysis.updateOne(
        { analysisId, userId },
        {
          $set: {
            techniqueScoreGlobal: globalScore,
            techniqueScoreMetrics: {
              body_line: typeof scores.body_line === "number" ? scores.body_line : undefined,
              symmetry: typeof scores.symmetry === "number" ? scores.symmetry : undefined,
              lockout_extension: typeof scores.lockout_extension === "number" ? scores.lockout_extension : undefined
            },
            techniqueImprovements: (techniqueScore.improvements || []).slice(0, 3).map((i) => i.message || "")
          }
        }
      );
    }

    res.json({
      analysisId,
      confirmedLabel: userLabel,
      datasetSampleId: scoring.sample_id || null,
      techniqueScore
    });
  } catch (err) {
    // Surface the error message to the client to ease debugging
    console.error("Error in /api/pose/confirm:", err);
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

const SaveToDashboardSchema = z.object({
  analysisId: z.string().min(1)
});

router.post("/save-to-dashboard", authRequired, async (req, res) => {
  try {
    const { analysisId } = SaveToDashboardSchema.parse(req.body);
    const userId = req.user.id;

    let analysis = await Analysis.findOne({ analysisId, userId }).lean();

    // Si aucune analyse n'existe encore pour cet utilisateur,
    // on essaie d'abord de récupérer une analyse anonyme (userId "demo")
    // puis, en dernier recours, n'importe quelle analyse avec ce même analysisId.
    if (!analysis) {
      const anonymous = await Analysis.findOne({ analysisId, userId: "demo" }).lean();
      if (anonymous) {
        await Analysis.updateOne(
          { _id: anonymous._id },
          { $set: { userId } }
        );
        analysis = { ...anonymous, userId };
      } else {
        const any = await Analysis.findOne({ analysisId }).lean();
        if (any) {
          await Analysis.updateOne(
            { _id: any._id },
            { $set: { userId } }
          );
          analysis = { ...any, userId };
        }
      }
    }

    if (!analysis) return res.status(404).json({ error: "Analyse introuvable." });
    if (analysis.techniqueScoreGlobal == null) {
      return res.status(400).json({ error: "Confirmez d'abord la figure et consultez le score avant de sauvegarder." });
    }

    const s3KeyResult = analysis.s3KeyResult || `users/${userId}/poses/${analysisId}/result.json`;
    const entry = {
      date: new Date(),
      analysisId,
      s3KeyImage: analysis.s3KeyImage,
      s3KeyResult,
      userLabel: analysis.userLabel,
      scoreGlobal: analysis.techniqueScoreGlobal,
      scoreMetrics: analysis.techniqueScoreMetrics || {},
      feedbackGlobal: analysis.techniqueScoreGlobal != null ? getScoreLabel(analysis.techniqueScoreGlobal) : undefined,
      topFeedbacks: analysis.techniqueImprovements || []
    };

    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $push: { posture_history: entry } }
    );

    res.json({ ok: true, message: "Analyse enregistrée dans votre tableau de bord." });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "analysisId requis." });
    }
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

module.exports = router;
