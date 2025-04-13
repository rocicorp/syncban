import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";

export const APIRoute = createAPIFileRoute("/api/electric/delete-item")({
  POST: async ({ request }) => {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response("Missing required fields", {
        status: 400,
      });
    }

    // Delete the item
    const result = await sql`
      DELETE FROM "item"
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      return new Response("Item not found", {
        status: 404,
      });
    }

    return json({ message: "Item deleted successfully" });
  },
});
