-- Migration to add image_url and updated_at fields to items table
-- Run this in your Supabase SQL editor

-- Add image_url column if it doesn't exist
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Update the unit check constraint to include additional units
ALTER TABLE items 
DROP CONSTRAINT IF EXISTS items_unit_check;

ALTER TABLE items 
ADD CONSTRAINT items_unit_check 
CHECK (unit IN ('pcs', 'ml', 'gr', 'box', 'set', 'pak', 'liter', 'pack'));

-- Create index for updated_at for better performance
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at);

-- Add comment to document the new fields
COMMENT ON COLUMN items.image_url IS 'URL to the item image stored in storage';
COMMENT ON COLUMN items.updated_at IS 'Last update timestamp for the item';
