import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Validate environment variable
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is required but not found in environment variables");
}

export const gemini = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "text-embedding-004", // Use the latest embedding model
});

// Function to test Gemini API connection
export const testGeminiConnection = async () => {
  try {
    // Test with a simple embedding
    const testText = "This is a test sentence for checking Gemini API connectivity.";
    const embedding = await gemini.embedQuery(testText);
    console.log(`✅ Gemini API test successful, embedding dimension: ${embedding.length}`);
    return true;
  } catch (error) {
    console.error("❌ Gemini API test failed:", error);
    return false;
  }
};