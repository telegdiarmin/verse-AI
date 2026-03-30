-- FK: users_verses.user_id -> users.id (was missing; causes orphaned rows on user delete)
ALTER TABLE users_verses
  ADD CONSTRAINT fk_users_verses_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Prevent duplicate ordinal positions within a poem
ALTER TABLE verses
  ADD CONSTRAINT uq_verses_poem_ordinal
  UNIQUE (poem_id, ordinal);
