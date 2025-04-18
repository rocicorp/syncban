import { useQuery, usePowerSync } from "@powersync/react";

export function Dump() {
  const db = usePowerSync();

  const { data: items } = useQuery(
    `SELECT * FROM item order by "order" asc`,
    //`SELECT * FROM item WHERE column_id = 'col-1' ORDER BY "order" ASC`,
    //`SELECT i.id, i.title, i."order", i.creator_id, c.name as "column_name" FROM item i INNER JOIN column c ON i.column_id = c.id order by i."order" desc`,

    []
  );

  return <pre>{JSON.stringify(items, null, "  ")}</pre>;
}
