-- Add username column to users table
-- Run this migration script against your RDS database

-- Step 1: Add username column (nullable first)
ALTER TABLE users ADD COLUMN username VARCHAR(30);

-- Step 2: Add unique index for username
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Step 3: Update existing users with temporary usernames
-- (You can update these manually through the app later)
UPDATE users SET username = 'user' || SUBSTRING(id::text, 1, 8) WHERE username IS NULL;

-- Step 4: Make username required
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Step 5: Add check constraint for username format
ALTER TABLE users ADD CONSTRAINT username_format 
CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$');

-- Verify the changes
SELECT username, name, email FROM users;