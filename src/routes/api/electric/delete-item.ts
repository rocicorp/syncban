import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";

export const APIRoute = createAPIFileRoute("/api/electric/delete-item")({
  POST: async ({ request }) => {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      throw json({ error: "Missing required field: id" }, { status: 400 });
    }

    // Delete the item
    const result = await sql`
      DELETE FROM "item"
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      throw json({ error: "Item not found" }, { status: 404 });
    }

    return json({ message: "Item deleted successfully" });
  },
});
