import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
}

export interface FriendshipWithUser {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
  friend_name: string;
  friend_username: string;
  friend_email: string;
  friend_avatar_url?: string;
  friend_bio?: string;
}

export class FriendshipModel {
  // Send a friend request
  static async sendRequest(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendship already exists
    const existingQuery = `
      SELECT * FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `;
    const existing = await pool.query(existingQuery, [userId, friendId]);
    
    if (existing.rows.length > 0) {
      throw new Error('Friendship already exists');
    }

    const id = uuidv4();
    const query = `
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId, friendId]);
    return result.rows[0];
  }

  // Respond to a friend request (accept/reject)
  static async respondToRequest(
    friendshipId: string, 
    userId: string, 
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<Friendship | null> {
    const query = `
      UPDATE friendships 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND friend_id = $3 AND status = 'PENDING'
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, friendshipId, userId]);
    return result.rows[0] || null;
  }

  // Get all friendships for a user (accepted friends)
  static async getFriends(userId: string): Promise<FriendshipWithUser[]> {
    const query = `
      SELECT 
        f.*,
        CASE 
          WHEN f.user_id = $1 THEN u2.name
          ELSE u1.name
        END as friend_name,
        CASE 
          WHEN f.user_id = $1 THEN u2.username
          ELSE u1.username
        END as friend_username,
        CASE 
          WHEN f.user_id = $1 THEN u2.email
          ELSE u1.email
        END as friend_email,
        CASE 
          WHEN f.user_id = $1 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as friend_avatar_url,
        CASE 
          WHEN f.user_id = $1 THEN u2.bio
          ELSE u1.bio
        END as friend_bio
      FROM friendships f
      JOIN users u1 ON f.user_id = u1.id
      JOIN users u2 ON f.friend_id = u2.id
      WHERE (f.user_id = $1 OR f.friend_id = $1) 
        AND f.status = 'ACCEPTED'
      ORDER BY f.updated_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get pending friend requests (received)
  static async getPendingRequests(userId: string): Promise<FriendshipWithUser[]> {
    const query = `
      SELECT 
        f.*,
        u.name as friend_name,
        u.username as friend_username,
        u.email as friend_email,
        u.avatar_url as friend_avatar_url,
        u.bio as friend_bio
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'PENDING'
      ORDER BY f.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get sent friend requests
  static async getSentRequests(userId: string): Promise<FriendshipWithUser[]> {
    const query = `
      SELECT 
        f.*,
        u.name as friend_name,
        u.username as friend_username,
        u.email as friend_email,
        u.avatar_url as friend_avatar_url,
        u.bio as friend_bio
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = $1 AND f.status = 'PENDING'
      ORDER BY f.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Remove friendship/cancel request
  static async removeFriendship(userId: string, friendshipId: string): Promise<boolean> {
    const query = `
      DELETE FROM friendships 
      WHERE id = $1 AND (user_id = $2 OR friend_id = $2)
    `;
    
    const result = await pool.query(query, [friendshipId, userId]);
    return result.rowCount > 0;
  }

  // Check friendship status between two users
  static async getFriendshipStatus(userId: string, friendId: string): Promise<Friendship | null> {
    const query = `
      SELECT * FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `;
    
    const result = await pool.query(query, [userId, friendId]);
    return result.rows[0] || null;
  }
}