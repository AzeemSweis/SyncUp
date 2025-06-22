import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { name, username, email, password, bio } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (id, name, username, email, password_hash, bio, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, username, email, avatar_url, bio, created_at, updated_at
    `;
    
    const values = [id, name, username, email, passwordHash, bio || null];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, username, email, password_hash, avatar_url, bio, created_at, updated_at
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }
  
  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, name, username, email, password_hash, avatar_url, bio, created_at, updated_at
      FROM users WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }
  
  static async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    const query = `
      SELECT id, name, username, email, password_hash, avatar_url, bio, created_at, updated_at
      FROM users WHERE email = $1 OR username = $1
    `;
    
    const result = await pool.query(query, [emailOrUsername]);
    return result.rows[0] || null;
  }
  
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, username, email, avatar_url, bio, created_at, updated_at
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  static async validatePassword(emailOrUsername: string, password: string): Promise<User | null> {
    const query = `
      SELECT id, name, username, email, password_hash, avatar_url, bio, created_at, updated_at
      FROM users WHERE email = $1 OR username = $1
    `;
    
    const result = await pool.query(query, [emailOrUsername]);
    const user = result.rows[0];
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    // Remove password_hash from returned user
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  static async updateProfile(id: string, updates: Partial<Pick<User, 'name' | 'username' | 'bio' | 'avatar_url'>>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    if (!setClause) return null;
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, username, email, avatar_url, bio, created_at, updated_at
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }
  
  static async searchUsers(searchTerm: string, excludeUserId?: string): Promise<User[]> {
    let query = `
      SELECT id, name, username, email, avatar_url, bio, created_at, updated_at
      FROM users 
      WHERE (name ILIKE $1 OR username ILIKE $1)
    `;
    
    const values = [`%${searchTerm}%`];
    
    if (excludeUserId) {
      query += ` AND id != $2`;
      values.push(excludeUserId);
    }
    
    query += ` ORDER BY 
      CASE 
        WHEN username ILIKE $1 THEN 1
        WHEN name ILIKE $1 THEN 2
        ELSE 3
      END, name LIMIT 20`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}