import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";
import { nanoid } from "nanoid";
import { generateKeyBetween } from "fractional-indexing";

export const APIRoute = createAPIFileRoute("/api/electric/create-item")({
  POST: async ({ request }) => {
    const body = await request.json();

    // Validate required fields
    if (!body.column_id || !body.title || !body.body) {
      throw json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique ID
    const id = nanoid();

    // Get the last item in the target column
    const [lastItem] = await sql`
        SELECT "order"
        FROM "item"
        WHERE column_id = ${body.column_id}
        ORDER BY "order" DESC
        LIMIT 1
      `;

    // Generate a new order key
    const order = generateKeyBetween(lastItem?.order ?? null, null);

    // Insert the new item
    const [newItem] = await sql`
        INSERT INTO "item" (id, column_id, title, body, "order")
        VALUES (${id}, ${body.column_id}, ${body.title}, ${body.body}, ${order})
        RETURNING *
      `;

    return json(newItem, { status: 201 });
  },
});
