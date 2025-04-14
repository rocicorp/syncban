import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "../../../db";
import { AddTaskRequest } from "~/components/KanbanBoard";

export const APIRoute = createAPIFileRoute("/api/electric/create-item")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();

      // TODO: Validate
      const task = body as AddTaskRequest;

      // Get creator_id from cookie
      const cookieHeader = request.headers.get("cookie");
      const cookies = Object.fromEntries(
        cookieHeader?.split(";").map((cookie) => cookie.trim().split("=")) ?? []
      );
      const creatorID = cookies["syncban_user_id"];

      if (!creatorID) {
        return new Response("User not authenticated", {
          status: 401,
        });
      }

      // TODO: Validate creatorID when auth implemented
      /*
      if (creatorID !== task.creatorID) {
        return new Response("User not authorized", {
          status: 403,
        });
      }
      */

      // Insert the new item
      const [newItem] = await sql`
          INSERT INTO "item" (id, column_id, title, body, "order", creator_id)
          VALUES (${task.id}, ${task.columnID}, ${task.title}, 'unused', ${task.order}, ${task.creatorID})
          RETURNING *
        `;

      return json(newItem, { status: 201 });
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", {
        status: 500,
      });
    }
  },
});
