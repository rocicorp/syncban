import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { generateKeyBetween } from "fractional-indexing";
import { sql } from "../../../db";

export const APIRoute = createAPIFileRoute("/api/electric/move-item")({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const { taskID, columnID, index } = body;
    if (!taskID || !columnID || index === undefined) {
      throw json({ error: "Missing required fields" }, { status: 400 });
    }
    // Get the current items
    const items = await sql`
      SELECT *
      FROM "item"
      WHERE column_id = ${columnID}
      AND id != ${taskID}
      ORDER BY "order" ASC
    `;

    const order = generateKeyBetween(
      items[index - 1]?.order ?? null,
      items[index]?.order ?? null
    );

    // Update the item
    const result = await sql`
      UPDATE "item"
      SET column_id = ${columnID}, "order" = ${order}
      WHERE id = ${taskID}
    `;

    if (result.count === 0) {
      throw json({ error: "Item not found" }, { status: 404 });
    }

    return json({ message: "Item moved successfully" });
  },
});
