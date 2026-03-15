const express = require("express");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const { presignPutObject } = require("../s3");

const router = express.Router();

const PresignSchema = z.object({
  userId: z.string().min(1).optional(),
  contentType: z.string().min(1).default("image/jpeg")
});

router.post("/presign", async (req, res) => {
  try {
    const parsed = PresignSchema.parse(req.body);
    const userId = req.user?.id ?? parsed.userId;
    if (!userId) {
      return res.status(400).json({ error: "Authentification requise ou userId requis." });
    }
    const contentType = parsed.contentType;

    const analysisId = uuidv4();
    const s3KeyImage = `users/${userId}/poses/${analysisId}/frame.jpg`;

    const uploadUrl = await presignPutObject({
      bucket: process.env.S3_BUCKET,
      key: s3KeyImage,
      contentType,
      expiresIn: 600
    });

    res.json({ analysisId, s3KeyImage, uploadUrl, expiresIn: 120 });
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad Request" });
  }
});

module.exports = router;
