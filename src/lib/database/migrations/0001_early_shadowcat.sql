ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_token_unique";--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_password_hash_unique" UNIQUE("password_hash");