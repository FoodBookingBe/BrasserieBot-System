-- Optimized composite indexes for Orders table
CREATE INDEX IF NOT EXISTS orders_restaurant_status_idx ON public.orders (restaurant_id, status);
CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx ON public.orders (restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS orders_pending_idx ON public.orders (restaurant_id, status) WHERE status = 'PENDING';

-- Optimized composite indexes for Reservations table 
CREATE INDEX IF NOT EXISTS reservations_restaurant_date_idx ON public.reservations (restaurant_id, reservation_date);
CREATE INDEX IF NOT EXISTS reservations_pending_idx ON public.reservations (restaurant_id, reservation_date) WHERE status = 'PENDING';

-- Text search indexes for customer search functionality
CREATE INDEX IF NOT EXISTS reservations_customer_search_idx ON public.reservations USING gin(to_tsvector('dutch', customer_name));

-- Optimized index for supplier payments
CREATE INDEX IF NOT EXISTS payments_supplier_status_idx ON public.supplier_payments (supplier_id, status);