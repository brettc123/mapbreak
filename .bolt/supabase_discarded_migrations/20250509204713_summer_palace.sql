/*
  # Stripe Integration Schema

  1. New Tables
    - `stripe_customers`: Links Supabase users to Stripe customers
    - `stripe_subscriptions`: Manages subscription data
    - `stripe_orders`: Stores order/purchase information
  
  2. Views
    - `stripe_user_subscriptions`: Secure view for user subscription data
    - `stripe_user_orders`: Secure view for user order history

  3. Security
    - Enables RLS on all tables
    - Implements policies for authenticated users
*/

-- Create subscription status enum
CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);

-- Create order status enum
CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);

-- Create customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    customer_id text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id text UNIQUE NOT NULL,
    subscription_id text DEFAULT null,
    price_id text DEFAULT null,
    current_period_start bigint DEFAULT null,
    current_period_end bigint DEFAULT null,
    cancel_at_period_end boolean DEFAULT false,
    payment_method_brand text DEFAULT null,
    payment_method_last4 text DEFAULT null,
    status stripe_subscription_status NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Create orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    checkout_session_id text NOT NULL,
    payment_intent_id text NOT NULL,
    customer_id text NOT NULL,
    amount_subtotal bigint NOT NULL,
    amount_total bigint NOT NULL,
    currency text NOT NULL,
    payment_status text NOT NULL,
    status stripe_order_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Create user subscriptions view
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Create user orders view
CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

GRANT SELECT ON stripe_user_orders TO authenticated;