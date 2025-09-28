import { Pinecone } from "@pinecone-database/pinecone";

// Validate environment variable
if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is required but not found in environment variables");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
  // Do NOT include 'environment' in v5+ (uses serverless by default)
});

// Function to check if Pinecone index exists and is ready
export const checkPineconeHealth = async (indexName: string = "lexinote") => {
  try {
    const index = pinecone.Index(indexName);
    const stats = await index.describeIndexStats();
    console.log(`🔍 Pinecone index '${indexName}' stats:`, stats);
    return true;
  } catch (error) {
    console.error(`❌ Pinecone health check failed for index '${indexName}':`, error);
    return false;
  }
};