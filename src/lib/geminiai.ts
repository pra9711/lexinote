import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Validate environment variable
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is required but not found in environment variables");
}

// Consistent embedding model configuration
const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_DIMENSION = 768; // Standard dimension for text-embedding-004

export const gemini = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: EMBEDDING_MODEL,
});

// Export configuration for consistency across the app
export const GEMINI_CONFIG = {
  model: EMBEDDING_MODEL,
  dimension: EMBEDDING_DIMENSION,
  apiKey: process.env.GOOGLE_API_KEY!,
};

// Function to create embeddings with consistent configuration
export const createEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY!,
    model: EMBEDDING_MODEL,
  });
};

// Function to test Gemini API connection
export const testGeminiConnection = async () => {
  try {
    // Test with a simple embedding
    const testText = "This is a test sentence for checking Gemini API connectivity.";
    const embedding = await gemini.embedQuery(testText);
    console.log(`✅ Gemini API test successful`);
    console.log(`📏 Embedding dimension: ${embedding.length}`);
    console.log(`🤖 Model: ${EMBEDDING_MODEL}`);
    
    // Validate expected dimension
    if (embedding.length !== EMBEDDING_DIMENSION) {
      console.warn(`⚠️ Warning: Expected dimension ${EMBEDDING_DIMENSION}, got ${embedding.length}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Gemini API test failed:", error);
    return false;
  }
};