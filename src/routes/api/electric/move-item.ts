import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";
import { MoveTaskRequest } from "~/components/KanbanBoard";

export const APIRoute = createAPIFileRoute("/api/electric/move-item")({
  POST: async ({ request, params }) => {
    const body = await request.json();

    // TODO: Validate
    const { taskID, columnID, order } = body as MoveTaskRequest;

    // Get the current items
    const items = await sql`
      SELECT *
      FROM "item"
      WHERE column_id = ${columnID}
      AND id != ${taskID}
      ORDER BY "order" ASC
    `;

    // Update the item
    const result = await sql`
      UPDATE "item"
      SET column_id = ${columnID}, "order" = ${order}
      WHERE id = ${taskID}
    `;

    if (result.count === 0) {
      return new Response("Item not found", {
        status: 404,
      });
    }

    return json({ message: "Item moved successfully" });
  },
});
