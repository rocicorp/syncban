CREATE TABLE "column" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "order" TEXT NOT NULL
);

CREATE TABLE "item" (
  "id" TEXT PRIMARY KEY,
  "column_id" TEXT REFERENCES "column"(id),
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "order" TEXT NOT NULL,
  "creator_id" TEXT NOT NULL
);

-- Insert test columns
INSERT INTO
  "column" ("id", "name", "order")
VALUES
  ('col-1', 'To Do', 'a0'),
  ('col-2', 'In Progress', 'a1'),
  ('col-3', 'Done', 'a2');
