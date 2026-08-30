import mongoose from "mongoose";
import { logger } from "./logger";

let connectionPromise: Promise<typeof mongoose> | undefined;

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    mode: { type: String, required: true, enum: ["residential", "commercial"] },
  },
  {
    collection: "quotes",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type QuoteDocument = mongoose.InferSchemaType<typeof quoteSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const QuoteModel =
  mongoose.models.Quote ||
  mongoose.model<QuoteDocument>("Quote", quoteSchema);

export async function connectToMongoDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  connectionPromise ??= mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8_000,
  });

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    logger.error({ err: error }, "Unable to connect to MongoDB");
    throw error;
  }
}