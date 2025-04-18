import { useQuery, useZero } from "@rocicorp/zero/react";
import { Schema } from "./schema";
import { Mutators } from "./mutators";

export default function Dump() {
  const z = useZero<Schema, Mutators>();

  const [columns] = useQuery(
    z.query.column
      .where("name", "!=", "Done")
      .orderBy("order", "asc")
      .related("tasks", (t) => t.orderBy("order", "desc"))
  );

  return <pre>{JSON.stringify(columns, null, "  ")}</pre>;
}
