import type { PageContextServer } from 'vike/types';
import type { Session } from '../lib/teuthologyAPI.d';

export type Data = {
  user?: Session['session'];
};

// Extend PageContextServer to include user session
type PageContextWithUser = PageContextServer & {
  user?: Session['session'];
};

/**
 * Global data loader that runs on every page
 * Passes user session data from server to all pages
 */
export async function data(pageContext: PageContextWithUser): Promise<Data> {
  // The user session is attached to pageContext by the Express server
  // after session validation middleware runs
  return {
    user: pageContext.user,
  };
}

// Made with Bob
