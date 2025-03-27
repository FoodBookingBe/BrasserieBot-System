-- Setup script voor BrasserieBot Supabase Database
-- Dit script maakt alle benodigde tabellen, RLS policies en indexen aan

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Reservations tabel
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    guests INTEGER DEFAULT 2,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    table_number INTEGER
);

-- Customers tabel
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    business_name TEXT,
    visits INTEGER DEFAULT 0,
    last_visit DATE,
    preferences TEXT
);

-- Menu items tabel
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true
);

-- Orders tabel
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT,
    table_number INTEGER,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending'
);

-- Settings tabel
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_name TEXT,
    logo_url TEXT,
    theme TEXT DEFAULT 'light',
    opening_hours JSONB,
    contact_info JSONB,
    notification_settings JSONB
);

-- ==========================================
-- 2. Row Level Security (RLS) Policies
-- ==========================================

-- Enable Row Level Security on all tables
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
    ON public.reservations 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reservations"
    ON public.reservations 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
    ON public.reservations 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
    ON public.reservations 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view their own customers"
    ON public.customers 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
    ON public.customers 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
    ON public.customers 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
    ON public.customers 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Menu items policies
CREATE POLICY "Users can view their own menu items"
    ON public.menu_items 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menu items"
    ON public.menu_items 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menu items"
    ON public.menu_items 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu items"
    ON public.menu_items 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
    ON public.orders 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
    ON public.orders 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON public.orders 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
    ON public.orders 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings"
    ON public.settings 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.settings 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.settings 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- ==========================================
-- 3. Indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS reservations_user_id_idx ON public.reservations (user_id);
CREATE INDEX IF NOT EXISTS reservations_date_idx ON public.reservations (date);
CREATE INDEX IF NOT EXISTS reservations_status_idx ON public.reservations (status);

CREATE INDEX IF NOT EXISTS customers_user_id_idx ON public.customers (user_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers (email);

CREATE INDEX IF NOT EXISTS menu_items_user_id_idx ON public.menu_items (user_id);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON public.menu_items (category);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);

-- ==========================================
-- 4. Functions and Triggers
-- ==========================================

-- Update last_visit in customers when a reservation is created
CREATE OR REPLACE FUNCTION update_customer_last_visit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.customers
    SET last_visit = NEW.date, visits = visits + 1
    WHERE email = NEW.email AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_reservation_insert
    AFTER INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_last_visit();

-- ==========================================
-- 5. Demo Data (optional)
-- ==========================================

-- Create a test admin user if not exists
-- Note: This would typically be done via Supabase Auth API, not direct SQL
-- INSERT INTO auth.users(id, email, encrypted_password, email_confirmed_at, role)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'admin@brasseriebot.com',
--     -- Password would be hashed in real scenario
--     'admin123',
--     now(),
--     'authenticated'
-- )
-- ON CONFLICT (id) DO NOTHING;