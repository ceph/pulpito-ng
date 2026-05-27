import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import type { Session } from '../../lib/teuthologyAPI.d';

const TEUTHOLOGY_API_SERVER = process.env.VITE_TEUTHOLOGY_API || '';
const GH_USER_COOKIE = 'GH_USER';

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: Session['session'] | undefined;
    }
  }
}

/**
 * Middleware to validate session cookies and fetch user data from Teuthology API
 * Attaches user session to req.session if valid
 */
export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check if GH_USER cookie exists
    const ghUserCookie = req.cookies[GH_USER_COOKIE];
    
    if (!ghUserCookie || !TEUTHOLOGY_API_SERVER) {
      // No session cookie or API server not configured
      req.session = undefined;
      next();
      return;
    }

    // Validate session with Teuthology API
    const apiUrl = new URL('/', TEUTHOLOGY_API_SERVER);
    
    try {
      const response = await axios.get<Session>(apiUrl.toString(), {
        headers: {
          Cookie: `${GH_USER_COOKIE}=${ghUserCookie}`,
        },
        withCredentials: true,
        timeout: 5000, // 5 second timeout
      });

      // If we got a valid session response, attach it to the request
      if (response.data?.session) {
        req.session = response.data.session;
      } else {
        req.session = undefined;
      }
    } catch (error) {
      // Session validation failed - clear the cookie
      console.error('Session validation failed:', error);
      res.clearCookie(GH_USER_COOKIE);
      req.session = undefined;
    }
  } catch (error) {
    // Unexpected error in middleware
    console.error('Session middleware error:', error);
    req.session = undefined;
  }

  next();
}

// Made with Bob
