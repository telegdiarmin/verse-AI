CREATE TABLE verses (
  poem_id uuid DEFAULT gen_random_uuid(),
  verse_id uuid DEFAULT gen_random_uuid(),
  ordinal INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (poem_id, verse_id)
);
