import { Router } from 'express';
import { 
  sendFriendRequest, 
  respondToFriendRequest, 
  getFriends, 
  getPendingRequests, 
  removeFriend 
} from '../controllers/friendsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/friends - Get user's friends list
router.get('/', getFriends);

// GET /api/friends/requests - Get pending friend requests (sent & received)
router.get('/requests', getPendingRequests);

// POST /api/friends/request - Send a friend request
router.post('/request', sendFriendRequest);

// PUT /api/friends/requests/:id - Respond to a friend request (accept/reject)
router.put('/requests/:id', respondToFriendRequest);

// DELETE /api/friends/:id - Remove friend/cancel request
router.delete('/:id', removeFriend);

export default router;