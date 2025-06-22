import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Friends } from './Friends';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'friends'>('dashboard');

  // Show Friends component if selected
  if (currentView === 'friends') {
    return (
      <div>
        <div style={{ 
          padding: '10px 20px',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
        <Friends />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#F9FAFB',
        borderRadius: '10px',
        border: '1px solid #E5E7EB'
      }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>
            Welcome to SyncUp, {user?.name}! 🎉
          </h1>
          <p style={{ margin: 0, color: '#6B7280' }}>
            {user?.bio || 'Ready to sync up with friends and plan amazing activities!'}
          </p>
        </div>
        
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Friends Card */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>👥 Friends</h3>
          <p style={{ color: '#6B7280', margin: '0 0 15px 0' }}>
            Connect with friends to see their availability
          </p>
          <button 
            onClick={() => setCurrentView('friends')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Manage Friends
          </button>
        </div>

        {/* Calendar Card */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>📅 Availability</h3>
          <p style={{ color: '#6B7280', margin: '0 0 15px 0' }}>
            Mark your free time to sync with friends
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Set Availability
          </button>
        </div>

        {/* Wishes Card */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>✨ Wish List</h3>
          <p style={{ color: '#6B7280', margin: '0 0 15px 0' }}>
            Share activities you'd love to do
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Add Wish
          </button>
        </div>

        {/* Plans Card */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>🎯 Plans</h3>
          <p style={{ color: '#6B7280', margin: '0 0 15px 0' }}>
            Create and manage group activities
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Create Plan
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>👤 Your Profile</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#1F2937' }}>
              {user?.name}
            </p>
            <p style={{ margin: '0 0 2px 0', color: '#3B82F6', fontSize: '14px', fontWeight: 'bold' }}>
              @{user?.username}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#6B7280', fontSize: '14px' }}>
              {user?.email}
            </p>
            {user?.bio && (
              <p style={{ margin: 0, color: '#6B7280', fontStyle: 'italic' }}>
                "{user.bio}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};