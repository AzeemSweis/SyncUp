import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UserModel } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
    return;
  }
  
  try {
    const payload = verifyToken(token);
    
    // Verify user still exists
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    req.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
    return;
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }
  
  next();
}