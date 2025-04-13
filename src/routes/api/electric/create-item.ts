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
      return new Response("Missing required fields", {
        status: 400,
      });
    }

    // Get creator_id from cookie
    const cookieHeader = request.headers.get("cookie");
    const cookies = Object.fromEntries(
      cookieHeader?.split(";").map((cookie) => cookie.trim().split("=")) ?? []
    );
    const creator_id = cookies["syncban_user_id"];

    if (!creator_id) {
      return new Response("User not authenticated", {
        status: 401,
      });
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
        INSERT INTO "item" (id, column_id, title, body, "order", creator_id)
        VALUES (${id}, ${body.column_id}, ${body.title}, ${body.body}, ${order}, ${creator_id})
        RETURNING *
      `;

    return json(newItem, { status: 201 });
  },
});
