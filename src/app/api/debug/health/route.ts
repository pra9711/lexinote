import { NextRequest, NextResponse } from "next/server";
import { checkPineconeHealth } from "@/lib/pinecone";
import { testGeminiConnection } from "@/lib/geminiai";
import prisma from "@/db";

export async function GET(req: NextRequest) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    environment: {
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    },
    services: {
      database: false,
      pinecone: false,
      gemini: false,
    },
    details: {} as any
  };

  // Test database connection
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    healthCheck.services.database = true;
    healthCheck.details.database = { userCount, status: "connected" };
  } catch (error) {
    healthCheck.details.database = { 
      error: error instanceof Error ? error.message : "Unknown error",
      status: "failed" 
    };
  }

  // Test Pinecone connection
  if (process.env.PINECONE_API_KEY) {
    try {
      const isHealthy = await checkPineconeHealth();
      healthCheck.services.pinecone = isHealthy;
      healthCheck.details.pinecone = { status: isHealthy ? "connected" : "failed" };
    } catch (error) {
      healthCheck.details.pinecone = { 
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed" 
      };
    }
  } else {
    healthCheck.details.pinecone = { status: "not configured" };
  }

  // Test Gemini connection
  if (process.env.GOOGLE_API_KEY) {
    try {
      const isWorking = await testGeminiConnection();
      healthCheck.services.gemini = isWorking;
      healthCheck.details.gemini = { status: isWorking ? "connected" : "failed" };
    } catch (error) {
      healthCheck.details.gemini = { 
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed" 
      };
    }
  } else {
    healthCheck.details.gemini = { status: "not configured" };
  }

  const allServicesHealthy = Object.values(healthCheck.services).every(service => service === true);
  
  return NextResponse.json(healthCheck, {
    status: allServicesHealthy ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}