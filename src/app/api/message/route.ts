import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import prisma from '@/db'
import { pinecone } from '@/lib/pinecone'
import { PineconeStore } from "@langchain/pinecone";
import { gemini } from "@/lib/geminiai";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    console.log("🔐 Message route user:", user?.id);

    const userId = user?.id;

    if (!userId) {
      console.error("❌ Unauthorized access attempt");
      return new Response("Unauthorized", { status: 401 })
    }

    const { fileId, message } = SendMessageValidator.parse(body);
    console.log(`💬 Processing message for file: ${fileId}`);

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId
      }
    })

    if (!file) {
      console.error(`❌ File not found: ${fileId} for user: ${userId}`);
      return new Response("File not found", { status: 404 });
    }

    if (file.uploadStatus !== 'SUCCESS') {
      console.error(`❌ File not ready for chat: ${fileId}, status: ${file.uploadStatus}`);
      return new Response("File is still processing. Please wait for upload to complete.", { status: 400 });
    }

    // Create user message
    await prisma.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId
      }
    })

    console.log("💾 User message saved to database");

    // Validate environment variables
    if (!process.env.GOOGLE_API_KEY) {
      console.error("❌ GOOGLE_API_KEY not found in environment variables");
      return new Response("AI service not configured", { status: 500 });
    }

    if (!process.env.PINECONE_API_KEY) {
      console.error("❌ PINECONE_API_KEY not found in environment variables");
      return new Response("Vector database not configured", { status: 500 });
    }

    // vectorise message using Gemini embeddings
    const embeddings = gemini;
    const pineconeIndex = pinecone.Index("lexinote");

    console.log(`🔍 Searching vectors in namespace: ${file.id}`);
    
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      namespace: file.id,
      pineconeIndex
    })

  const results = await vectorStore.similaritySearch(message, 4)

  const previousMessages = await prisma.message.findMany({
    where: {
      fileId
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 6
  })

  const formattedMessages = previousMessages.map(previousMessage => ({
    role: previousMessage.isUserMessage ? "user" as const : "assistant" as const,
    content: previousMessage.text
  }))

  // Compose prompt for Gemini
  const prompt = `
Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

----------------

PREVIOUS CONVERSATION:
${formattedMessages.map((message) => {
    if (message.role === 'user') return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  }).join('')}

----------------

CONTEXT:
${results.map((r) => r.pageContent).join('\n\n')}

USER INPUT: ${message}
`;

  // Call Gemini API for completion using new authentication method
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  console.log("🔑 Gemini API Key exists:", !!apiKey);
  console.log("📝 Prompt length:", prompt.length);
  
  if (!apiKey) {
    console.error("❌ No API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY in .env.local");
    return new Response("API key not configured", { status: 500 });
  }
  
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: { 
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: prompt 
          }] 
        }]
      })
    }
  );

  console.log("🌐 Gemini API Response Status:", response.status);

  let data;
  try {
    data = await response.json();
    console.log("📊 Gemini API Response Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Failed to parse Gemini response:", e);
    return new Response("Gemini API returned an invalid or empty response.", { status: 500 });
  }

  if (!response.ok) {
    const errorMsg = data?.error?.message || "Gemini API error";
    console.error("❌ Gemini API Error:", errorMsg, data);
    return new Response(errorMsg, { status: response.status });
  }

  const completion = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!completion) {
    console.error("❌ No completion text found in response:", data);
    return new Response("No response generated from AI", { status: 500 });
  }

  console.log("✅ AI Response generated:", completion.substring(0, 100) + "...");
  
  await prisma.message.create({
    data: {
      text: completion,
      isUserMessage: false,
      fileId,
      userId
    },
  });

  return new Response(completion, { status: 200 });
  } catch (error) {
    console.error("❌ Error in message processing:", error);
    
    // Return a helpful error message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(`Error processing message: ${errorMessage}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
