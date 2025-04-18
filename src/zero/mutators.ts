// mutators.ts
import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema } from "./schema";
import {
  AddTaskRequest,
  DeleteTaskRequest,
  MoveTaskRequest,
} from "~/components/KanbanBoard";
import { generateKeyBetween } from "fractional-indexing";

export function createMutators() {
  return {
    item: {
      create: async (tx, req: AddTaskRequest) => {
        const [last] = await tx.query.item
          .where("columnID", req.columnID)
          .orderBy("order", "desc")
          .run();

        const order = generateKeyBetween(last?.order ?? null, null);

        await tx.mutate.item.insert({
          ...req,
          body: "unused",
          order,
        });
      },

      delete: async (tx, req: DeleteTaskRequest) => {
        await tx.mutate.item.delete(req);
      },

      move: async (tx, req: MoveTaskRequest) => {
        const destSiblings = await tx.query.item
          .where("columnID", req.columnID)
          .orderBy("order", "asc")
          .run();

        const existingIndex = destSiblings.findIndex(
          (task) => task.id === req.taskID
        );

        let destIndex = req.index;
        if (existingIndex !== -1) {
          if (existingIndex < destIndex) {
            destIndex++;
          }
        }

        const order = generateKeyBetween(
          destSiblings[req.index - 1]?.order ?? null,
          destSiblings[req.index]?.order ?? null
        );

        await tx.mutate.item.update({
          id: req.taskID,
          columnID: req.columnID,
          order,
        });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
