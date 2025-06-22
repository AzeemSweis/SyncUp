import React, { useState, useEffect } from 'react';
import { friendsAPI, userAPI } from '../utils/api';

interface Friend {
  id: string;
  friend_id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  friendship_date: string;
}

interface FriendRequest {
  id: string;
  friend_id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  requested_at: string;
}

interface SearchResult {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
}

export const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ received: FriendRequest[]; sent: FriendRequest[] }>({ received: [], sent: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load friends and requests on component mount
  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.friends);
    } catch (err: any) {
      setError('Failed to load friends');
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await friendsAPI.getPendingRequests();
      setPendingRequests(response);
    } catch (err: any) {
      setError('Failed to load friend requests');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.users);
      setError('');
    } catch (err: any) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      await friendsAPI.sendFriendRequest(friendId);
      setError('');
      // Remove from search results or mark as requested
      setSearchResults(prev => prev.filter(user => user.id !== friendId));
      loadPendingRequests(); // Refresh sent requests
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send friend request');
    }
  };

  const respondToRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await friendsAPI.respondToFriendRequest(requestId, status);
      setError('');
      loadFriends(); // Refresh friends list
      loadPendingRequests(); // Refresh requests
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to respond to request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      await friendsAPI.removeFriend(friendshipId);
      setError('');
      loadFriends(); // Refresh friends list
      loadPendingRequests(); // Refresh requests (in case it was a pending request)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove friend');
    }
  };

  const UserCard: React.FC<{ user: Friend | FriendRequest | SearchResult; type: 'friend' | 'received' | 'sent' | 'search' }> = ({ user, type }) => (
    <div style={{ 
      padding: '15px', 
      backgroundColor: 'white', 
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          backgroundColor: '#3B82F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#1F2937' }}>{user.name}</h4>
          <p style={{ margin: '0 0 2px 0', color: '#3B82F6', fontSize: '14px', fontWeight: 'bold' }}>@{user.username}</p>
          <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '12px' }}>{user.email}</p>
          {user.bio && (
            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>
              "{user.bio}"
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {type === 'search' && (
            <button
              onClick={() => sendFriendRequest(user.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Add Friend
            </button>
          )}
          
          {type === 'received' && (
            <>
              <button
                onClick={() => respondToRequest((user as FriendRequest).id, 'ACCEPTED')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest((user as FriendRequest).id, 'REJECTED')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Reject
              </button>
            </>
          )}

          {(type === 'friend' || type === 'sent') && (
            <button
              onClick={() => removeFriend((user as Friend).id)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {type === 'friend' ? 'Remove' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#1F2937' }}>👥 Friends</h1>

      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#FEE2E2', 
          color: '#DC2626', 
          borderRadius: '5px',
          border: '1px solid #FECACA'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '2px', 
        marginBottom: '20px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        {[
          { key: 'friends', label: `My Friends (${friends.length})` },
          { key: 'requests', label: `Requests (${pendingRequests.received.length + pendingRequests.sent.length})` },
          { key: 'search', label: 'Find Friends' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? '#3B82F6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6B7280',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <p>No friends yet. Start by searching for people to connect with!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map(friend => (
                <UserCard key={friend.id} user={friend} type="friend" />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {pendingRequests.received.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Received Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.received.map(request => (
                  <UserCard key={request.id} user={request} type="received" />
                ))}
              </div>
            </div>
          )}

          {pendingRequests.sent.length > 0 && (
            <div>
              <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Sent Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.sent.map(request => (
                  <UserCard key={request.id} user={request} type="sent" />
                ))}
              </div>
            </div>
          )}

          {pendingRequests.received.length === 0 && pendingRequests.sent.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <p>No pending friend requests.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
              <button
                onClick={searchUsers}
                disabled={loading || searchQuery.length < 2}
                style={{
                  padding: '12px 20px',
                  backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {searchResults.map(user => (
                <UserCard key={user.id} user={user} type="search" />
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};