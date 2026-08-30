import { Router, type IRouter } from "express";
import {
  CreateQuoteBody,
  CreateQuoteResponse,
  ListQuotesResponse,
} from "@workspace/api-zod";
import { connectToMongoDb, QuoteModel, type QuoteDocument } from "../lib/mongodb";
import { logger } from "../lib/logger";
import { sendOwnerNotification, sendCustomerAutoReply } from "../lib/email";
import { requireAdminKey } from "../middlewares/admin-auth";

const router: IRouter = Router();

function serializeQuote(quote: QuoteDocument) {
  return {
    id: quote._id.toString(),
    name: quote.name,
    contact: quote.contact,
    message: quote.message,
    mode: quote.mode,
    createdAt: quote.createdAt,
  };
}

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a valid quote request." });
    return;
  }

  let quote: QuoteDocument;

  try {
    await connectToMongoDb();
    quote = await QuoteModel.create(parsed.data);
  } catch (error) {
    req.log.error({ err: error }, "Unable to create quote request");
    res.status(500).json({ error: "We could not save your request. Please call us instead." });
    return;
  }

  // Email notifications are best-effort: a failure here must never fail
  // the quote submission itself, since the request is already safely saved.
  try {
    await Promise.all([sendOwnerNotification(quote), sendCustomerAutoReply(quote)]);
  } catch (error) {
    req.log.error({ err: error }, "Unable to send quote notification email(s)");
  }

  res.status(201).json(CreateQuoteResponse.parse(serializeQuote(quote)));
});

router.get("/quotes", requireAdminKey, async (req, res): Promise<void> => {
  try {
    await connectToMongoDb();
    const quotes = await QuoteModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(
      ListQuotesResponse.parse(
        quotes.map((quote) => ({
          id: quote._id.toString(),
          name: quote.name,
          contact: quote.contact,
          message: quote.message,
          mode: quote.mode,
          createdAt: quote.createdAt,
        })),
      ),
    );
  } catch (error) {
    logger.error({ err: error }, "Unable to list quote requests");
    res.status(500).json({ error: "Quote requests are temporarily unavailable." });
  }
});

export default router;