CREATE TABLE users_verses (
  user_id uuid NOT NULL,
  poem_id uuid NOT NULL,
  verse_id uuid NOT NULL,
  PRIMARY KEY (user_id, poem_id, verse_id),
  FOREIGN KEY (poem_id, verse_id) REFERENCES verses (poem_id, verse_id) ON DELETE CASCADE
);
