-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_events_date" ON "events"("date");

-- CreateIndex
CREATE INDEX "idx_events_location" ON "events"("location");
