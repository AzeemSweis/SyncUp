import { Request, Response } from 'express';
import { UserModel, CreateUserData } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { z } from 'zod';

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().max(500).optional()
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
});

export const signup = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);
    
    // Check if user already exists by email
    const existingUserByEmail = await UserModel.findByEmail(validatedData.email);
    if (existingUserByEmail) {
      res.status(400).json({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      });
      return;
    }
    
    // Check if username already exists
    const existingUserByUsername = await UserModel.findByUsername(validatedData.username);
    if (existingUserByUsername) {
      res.status(400).json({
        error: 'Username is already taken',
        code: 'USERNAME_EXISTS'
      });
      return;
    }
    
    // Create user
    const user = await UserModel.create(validatedData as CreateUserData);
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    });
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    if (error.code === '23505') { // PostgreSQL unique violation
      if (error.constraint?.includes('username')) {
        res.status(400).json({
          error: 'Username is already taken',
          code: 'USERNAME_EXISTS'
        });
      } else {
        res.status(400).json({
          error: 'User with this email already exists',
          code: 'EMAIL_EXISTS'
        });
      }
      return;
    }
    
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { emailOrUsername, password } = loginSchema.parse(req.body);
    
    // Validate credentials
    const user = await UserModel.validatePassword(emailOrUsername, password);
    if (!user) {
      res.status(401).json({
        error: 'Invalid email/username or password',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    });
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }
    
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }
    
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
      bio: z.string().max(500).optional(),
      avatar_url: z.string().url().optional()
    });
    
    const updates = updateSchema.parse(req.body);
    
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
      return;
    }
    
    const user = await UserModel.updateProfile(userId, updates);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
      return;
    }
    
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};