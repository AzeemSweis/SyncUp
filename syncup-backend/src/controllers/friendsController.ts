import { Request, Response } from 'express';
import { FriendshipModel } from '../models/Friendship';
import { UserModel } from '../models/User';
import { z } from 'zod';

const sendRequestSchema = z.object({
  friendId: z.string().uuid('Invalid friend ID format')
});

const respondRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'])
});

export const sendFriendRequest = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const { friendId } = sendRequestSchema.parse(req.body);

    // Can't befriend yourself
    if (userId === friendId) {
      res.status(400).json({
        error: 'Cannot send friend request to yourself',
        code: 'INVALID_REQUEST'
      });
      return;
    }

    // Check if friend exists
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Send friend request
    const friendship = await FriendshipModel.sendRequest(userId, friendId);

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship: {
        id: friendship.id,
        friend_id: friendId,
        friend_name: friend.name,
        friend_username: friend.username,
        friend_email: friend.email,
        status: friendship.status,
        created_at: friendship.created_at
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

    if (error.message === 'Friendship already exists') {
      res.status(400).json({
        error: 'Friendship already exists',
        code: 'FRIENDSHIP_EXISTS'
      });
      return;
    }

    console.error('Send friend request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const respondToFriendRequest = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const { id: friendshipId } = req.params;
    const { status } = respondRequestSchema.parse(req.body);

    const friendship = await FriendshipModel.respondToRequest(friendshipId, userId, status);

    if (!friendship) {
      res.status(404).json({
        error: 'Friend request not found or already processed',
        code: 'REQUEST_NOT_FOUND'
      });
      return;
    }

    res.json({
      message: `Friend request ${status.toLowerCase()}`,
      friendship: {
        id: friendship.id,
        status: friendship.status,
        updated_at: friendship.updated_at
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

    console.error('Respond to friend request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const getFriends = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const friends = await FriendshipModel.getFriends(userId);

    res.json({
      friends: friends.map(friend => ({
        id: friend.id,
        friend_id: friend.user_id === userId ? friend.friend_id : friend.user_id,
        name: friend.friend_name,
        username: friend.friend_username,
        email: friend.friend_email,
        avatar_url: friend.friend_avatar_url,
        bio: friend.friend_bio,
        friendship_date: friend.updated_at
      }))
    });

  } catch (error: any) {
    console.error('Get friends error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const getPendingRequests = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const pendingRequests = await FriendshipModel.getPendingRequests(userId);
    const sentRequests = await FriendshipModel.getSentRequests(userId);

    res.json({
      received: pendingRequests.map(request => ({
        id: request.id,
        friend_id: request.user_id,
        name: request.friend_name,
        username: request.friend_username,
        email: request.friend_email,
        avatar_url: request.friend_avatar_url,
        bio: request.friend_bio,
        requested_at: request.created_at
      })),
      sent: sentRequests.map(request => ({
        id: request.id,
        friend_id: request.friend_id,
        name: request.friend_name,
        username: request.friend_username,
        email: request.friend_email,
        avatar_url: request.friend_avatar_url,
        bio: request.friend_bio,
        requested_at: request.created_at
      }))
    });

  } catch (error: any) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const removeFriend = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const { id: friendshipId } = req.params;

    const removed = await FriendshipModel.removeFriendship(userId, friendshipId);

    if (!removed) {
      res.status(404).json({
        error: 'Friendship not found',
        code: 'FRIENDSHIP_NOT_FOUND'
      });
      return;
    }

    res.json({
      message: 'Friendship removed successfully'
    });

  } catch (error: any) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};