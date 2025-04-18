import { CrudEntry, UpdateType } from "@powersync/web";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import assert from "assert";
import { generateKeyBetween } from "fractional-indexing";
import { sql } from "~/db";
import { must } from "~/utils/assert";
import { compareOrdered } from "~/utils/lex";

type CrudEntryOutputJSON = {
  op_id: number;
  op: UpdateType;
  type: string;
  id: string;
  tx_id?: number;
  data?: Record<string, any>;
};

export const APIRoute = createAPIFileRoute("/api/powersync/upload")({
  POST: async ({ request }) => {
    try {
      // TODO validate
      const body = (await request.json()) as CrudEntryOutputJSON[];
      console.log("received upload powersync data", body);

      for (const entry of body) {
        assert(entry.type === "item", "Unsupported table");
        switch (entry.op) {
          case UpdateType.PUT:
            await handlePut(entry);
            break;
          case UpdateType.PATCH:
            await handlePatch(entry);
            break;
          case UpdateType.DELETE:
            await handleDelete(entry);
            break;
          default:
            throw new Error(`Unsupported operation ${entry.op}`);
        }
      }

      return new Response("OK");
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", {
        status: 500,
      });
    }
  },
});

async function handlePut(entry: CrudEntryOutputJSON) {
  const { id } = entry;
  const row = must(entry.data);

  const [last] = await sql`
    SELECT *
    FROM "item"
    WHERE column_id = ${row.column_id}
    ORDER BY "order" DESC
    LIMIT 1
  `;

  console.log({ last });

  const order = generateKeyBetween(last?.order ?? null, null);

  console.log({ order });

  // Insert the new item
  await sql`
      INSERT INTO "item" (id, column_id, title, body, "order", creator_id)
      VALUES (${id}, ${row.column_id}, ${row.title}, 'unused', ${order}, ${row.creator_id})
    `;
}

async function handlePatch(entry: CrudEntryOutputJSON) {
  console.log("handling patch", entry);

  const { id } = entry;
  const data = must(entry.data);

  // We only expect one type of patch - to move an item.
  // A real implementation would have to handle all types of patches that can happen.
  const EXPECTED_CHANGED_FIELDS = ["id", "column_id", "order"];
  for (const key of Object.keys(data)) {
    if (!EXPECTED_CHANGED_FIELDS.includes(key)) {
      throw new Error(`Unexpected field ${key} in PATCH`);
    }
  }

  // We have to load the previous because powersync only sends the changed
  // columns, but we need both for below logic even if unchanged.
  let [row] = await sql`
    SELECT column_id, "order"
    FROM "item"
    WHERE id = ${id}
  `;
  assert(row);

  // Smoosh in the changes.
  row = {
    ...row,
    ...data,
  };

  console.log({ row });

  // We only use the order field to determine the insertion position. Because of
  // concurrency, we cannot use it as-is. There could have been some other
  // client that inserted at the same position at the same time and the order
  // values must be unique.
  const destSiblings = await sql`
    SELECT *
    FROM "item"
    WHERE column_id = ${row.column_id}
    ORDER BY "order" ASC`;

  console.log({ destSiblings });

  // Insert the new row before the first row that has an order greater than or
  // equal to new row's order.
  let destIndex = destSiblings.findIndex(
    (task) => compareOrdered(task, row) >= 0
  );
  console.log({ destIndex });
  if (destIndex === -1) {
    destIndex = 0;
  }

  console.log({ destIndex });

  const prevIndex = destSiblings.findIndex((task) => task.id === entry.id);
  if (prevIndex !== -1) {
    if (prevIndex < destIndex) {
      destIndex++;
    }
  }

  console.log({ prevIndex, destIndex });

  const order = generateKeyBetween(
    destSiblings[destIndex - 1]?.order ?? null,
    destSiblings[destIndex]?.order ?? null
  );

  console.log({ order });

  await sql`
    UPDATE "item"
    SET column_id = ${row.column_id}, "order" = ${order}
    WHERE id = ${entry.id}
  `;
}

async function handleDelete(entry: CrudEntryOutputJSON) {
  await sql`
    DELETE FROM "item"
    WHERE id = ${entry.id}
  `;
}
