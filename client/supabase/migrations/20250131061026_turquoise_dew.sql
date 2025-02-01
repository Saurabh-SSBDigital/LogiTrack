/*
  # Initial Schema Setup for Logistics Portal

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `role` (text)
      - `created_at` (timestamp)
    
    - `shipments`
      - `id` (uuid, primary key)
      - `package_id` (text)
      - `to_address` (text)
      - `from_address` (text)
      - `sender_name` (text)
      - `image_url` (text)
      - `note` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for admin users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- Create shipments table
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id text NOT NULL,
  to_address text NOT NULL,
  from_address text NOT NULL,
  sender_name text NOT NULL,
  image_url text,
  note text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Shipments policies
CREATE POLICY "Users can view own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );