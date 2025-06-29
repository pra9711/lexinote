import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { createTRPCContext } from '@/trpc/context';

const handler = async (req: Request) => {
  try {
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: ({ req }) => createTRPCContext({ req }),
      onError: ({ error, path }) => {
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
      },
    });
  } catch (error) {
    console.error('tRPC handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export { handler as GET, handler as POST };