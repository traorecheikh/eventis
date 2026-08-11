CREATE TABLE "registrations" (
  "id" SERIAL NOT NULL,
  "event_id" INTEGER NOT NULL,
  "participant_id" INTEGER NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'confirmee',
  "registered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelled_at" TIMESTAMPTZ,
  CONSTRAINT "registrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "registrations_status_check" CHECK ("status" IN ('confirmee', 'annulee'))
);
CREATE UNIQUE INDEX "idx_registrations_unique_active" ON "registrations"("event_id", "participant_id") WHERE "status" = 'confirmee';
CREATE INDEX "idx_registrations_event" ON "registrations"("event_id");
CREATE INDEX "idx_registrations_participant" ON "registrations"("participant_id");
