-- Add likes_count to moments table
ALTER TABLE moments ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;
