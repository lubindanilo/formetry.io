const mongoose = require("mongoose");

/**
 * Un élément d'historique de posture : une analyse datée avec scores et feedback.
 */
const PostureHistoryEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    analysisId: { type: String },
    s3KeyImage: { type: String },
    s3KeyResult: { type: String },
    userLabel: { type: String },
    /** Score global 0–100 */
    scoreGlobal: { type: Number },
    /** Les 3 métriques : body_line, symmetry, lockout_extension (0–100) */
    scoreMetrics: {
      body_line: Number,
      symmetry: Number,
      lockout_extension: Number
    },
    /** Libellé qualitatif : "Excellent", "Très bien", "Bien", "Correct", "Fragile", "À retravailler" */
    feedbackGlobal: { type: String },
    /** Top 3 messages d'amélioration (texte) */
    topFeedbacks: { type: [String], default: [] }
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashed_password: { type: String, required: true },
    /** Nom affiché (optionnel) */
    displayName: { type: String, default: "" },
    posture_history: { type: [PostureHistoryEntrySchema], default: [] }
  },
  { versionKey: false, timestamps: true }
);

UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
