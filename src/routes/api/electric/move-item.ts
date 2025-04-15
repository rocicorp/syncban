import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";
import { MoveTaskRequest } from "~/components/KanbanBoard";
import { generateKeyBetween } from "fractional-indexing";
import { compareOrdered } from "~/utils/lex";

export const APIRoute = createAPIFileRoute("/api/electric/move-item")({
  POST: async ({ request, params }) => {
    try {
      const body = (await request.json()) as MoveTaskRequest;
      console.log({ body });

      // TODO: Validate
      const { taskID, columnID } = body;
      let { index } = body;

      const destSiblings = await sql`
        SELECT *
        FROM "item"
        WHERE column_id = ${columnID}
      `;
      destSiblings.sort(compareOrdered);

      console.log({ destSiblings });

      const existingIndex = destSiblings.findIndex(
        (task) => task.id === taskID
      );
      console.log({ existingIndex });
      if (existingIndex !== -1) {
        if (existingIndex < index) {
          index++;
        }
      }
      console.log({ index });

      const order = generateKeyBetween(
        destSiblings[index - 1]?.order ?? null,
        destSiblings[index]?.order ?? null
      );

      console.log({ order });

      // Update the item
      const result = await sql`
        UPDATE "item"
        SET column_id = ${columnID}, "order" = ${order}
        WHERE id = ${taskID}
      `;

      console.log(result.count);

      if (result.count === 0) {
        return new Response("Item not found", {
          status: 404,
        });
      }

      return json({ message: "Item moved successfully" });
    } catch (e) {
      console.error("Error moving item", e);
      return new Response("Internal Server Error", {
        status: 500,
      });
    }
  },
});
