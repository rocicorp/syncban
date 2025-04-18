import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { connectionProvider, PushProcessor } from "@rocicorp/zero/pg";
import { schema } from "~/zero/schema";
import { createMutators } from "~/zero/mutators";
import { sql } from "~/db";

const processor = new PushProcessor(schema, connectionProvider(sql));

export const APIRoute = createAPIFileRoute("/api/zero/push")({
  POST: async ({ request }) => {
    try {
      const result = await processor.process(
        createMutators(),
        Object.fromEntries(new URL(request.url).searchParams.entries()),
        await request.json()
      );
      return await json(result);
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", {
        status: 500,
      });
    }
  },
});
