-- Hierarchical inventory support: lab -> room -> item.
ALTER TABLE labs ADD COLUMN IF NOT EXISTS code VARCHAR(100);
ALTER TABLE labs ADD COLUMN IF NOT EXISTS description TEXT;

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE items ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;
ALTER TABLE items ADD COLUMN IF NOT EXISTS sop TEXT;

CREATE INDEX IF NOT EXISTS idx_rooms_lab_id ON rooms(lab_id);
CREATE INDEX IF NOT EXISTS idx_items_room_id ON items(room_id);

-- Keep the first room for each lab/code pair and remove older duplicates.
DELETE FROM rooms
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY lab_id, LOWER(TRIM(code)) ORDER BY created_at, id
        ) AS duplicate_number
        FROM rooms
        WHERE code IS NOT NULL AND TRIM(code) <> ''
    ) duplicates
    WHERE duplicate_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS rooms_lab_id_code_unique
    ON rooms (lab_id, LOWER(TRIM(code)))
    WHERE code IS NOT NULL AND TRIM(code) <> '';

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "All operations on rooms" ON rooms FOR ALL USING (true);