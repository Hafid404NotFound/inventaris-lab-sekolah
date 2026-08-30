-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table (Multi-tenant)
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Labs table (Multi-lab per school)
CREATE TABLE labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    pic_name VARCHAR(255),
    location TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table (per lab)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('asset', 'consumable')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Items table (Alat & Bahan)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    type VARCHAR(20) CHECK (type IN ('alat', 'bahan')) NOT NULL,
    total_qty INTEGER DEFAULT 0,
    available_qty INTEGER DEFAULT 0,
    unit VARCHAR(20) CHECK (unit IN ('pcs', 'ml', 'gr', 'box', 'set', 'pak', 'liter', 'pack')),
    condition VARCHAR(20) CHECK (condition IN ('baik', 'rusak_ringan', 'rusak_berat')) DEFAULT 'baik',
    location_rack VARCHAR(100),
    expired_date DATE,
    min_stock_alert INTEGER DEFAULT 5,
    specs_detail TEXT,
    sop TEXT,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Loans table (Peminjaman)
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    borrower_name VARCHAR(255) NOT NULL,
    borrower_role VARCHAR(50) CHECK (borrower_role IN ('super_admin', 'kepala_lab', 'guru', 'siswa', 'guest')),
    loan_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    qty INTEGER DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('dipinjam', 'kembali', 'rusak_hilang')) DEFAULT 'dipinjam',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_labs_school_id ON labs(school_id);
CREATE INDEX idx_categories_lab_id ON categories(lab_id);
CREATE INDEX idx_rooms_lab_id ON rooms(lab_id);
CREATE INDEX idx_items_lab_id ON items(lab_id);
CREATE INDEX idx_items_room_id ON items(room_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_updated_at ON items(updated_at);
CREATE INDEX idx_loans_item_id ON loans(item_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_loan_date ON loans(loan_date);

-- Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your auth system)
CREATE POLICY "Public read access for schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read access for labs" ON labs FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public read access for items" ON items FOR SELECT USING (true);
CREATE POLICY "Public read access for loans" ON loans FOR SELECT USING (true);

-- Allow all operations for development (restrict these in production)
CREATE POLICY "All operations on schools" ON schools FOR ALL USING (true);
CREATE POLICY "All operations on labs" ON labs FOR ALL USING (true);
CREATE POLICY "All operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "All operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "All operations on items" ON items FOR ALL USING (true);
CREATE POLICY "All operations on loans" ON loans FOR ALL USING (true);