CREATE TABLE "participants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "participants_type_check" CHECK ("type" IN ('etudiant', 'professeur', 'externe'))
);
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");
CREATE INDEX "idx_participants_name" ON "participants"("name");
