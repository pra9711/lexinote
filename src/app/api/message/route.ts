import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const userId = user?.id;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { fileId, message } = SendMessageValidator.parse(body);

    // Lazy import dependencies to avoid build issues
    const { default: prisma } = await import('@/db');

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId
      }
    })

    if (!file) return new Response("Not found", { status: 404 });

    await prisma.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId
      }
    })

    // Check environment variables
    if (!process.env.GOOGLE_API_KEY) {
      return new Response("Configuration error", { status: 500 });
    }

    // Lazy import for AI dependencies
    const [
      { pinecone },
      { PineconeStore },
      { gemini }
    ] = await Promise.all([
      import('@/lib/pinecone'),
      import("@langchain/pinecone"),
      import("@/lib/geminiai")
    ]);

    // vectorise message using Gemini embeddings
    const embeddings = gemini;
    const pineconeIndex = pinecone.Index("lexinote");

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

    // Call Gemini API for completion
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (e) {
      return new Response("AI service error", { status: 500 });
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || "AI service error";
      return new Response(errorMsg, { status: response.status });
    }

    const completion = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    await prisma.message.create({
      data: {
        text: completion || "I apologize, but I couldn't generate a response.",
        isUserMessage: false,
        fileId,
        userId
      },
    });

    return new Response(completion || "I apologize, but I couldn't generate a response.", { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Message API endpoint' });
}