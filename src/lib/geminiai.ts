import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const gemini = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
});