ALTER TABLE "users"
ADD COLUMN "avatar_url" TEXT;

ALTER TYPE "NotificationType"
ADD VALUE IF NOT EXISTS 'REPLY';

ALTER TABLE "notifications"
ADD COLUMN "actor_id" TEXT,
ADD COLUMN "post_id" TEXT,
ADD COLUMN "comment_id" TEXT;

ALTER TABLE "notifications"
DROP COLUMN IF EXISTS "reference_id";

DROP INDEX IF EXISTS "notifications_user_id_idx";
DROP INDEX IF EXISTS "notifications_is_read_idx";

CREATE INDEX "notifications_user_id_is_read_idx"
ON "notifications"("user_id", "is_read");

CREATE INDEX "notifications_actor_id_idx"
ON "notifications"("actor_id");

CREATE INDEX "notifications_post_id_idx"
ON "notifications"("post_id");

CREATE INDEX "notifications_comment_id_idx"
ON "notifications"("comment_id");

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_comment_id_fkey"
FOREIGN KEY ("comment_id") REFERENCES "comments"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
