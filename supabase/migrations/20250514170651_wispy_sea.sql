/*
  # Add Push Notifications Support

  1. New Tables
    - `user_push_tokens`: Stores user push notification tokens
      - `user_id` (references auth.users)
      - `token` (push notification token)
      - Includes timestamps and soft delete

  2. Security
    - Enables RLS on new table
    - Adds policy for users to manage their own tokens
*/

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT null
);

ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push tokens"
  ON user_push_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());