import { column, Schema, Table } from "@powersync/web";

const columnTable = new Table(
  {
    // id column (text) is automatically included
    name: column.text,
    order: column.text,
  },
  { indexes: {} }
);

const itemTable = new Table(
  {
    // id column (text) is automatically included
    column_id: column.text,
    creator_id: column.text,
    title: column.text,
    body: column.text,
    order: column.text,
  },
  { indexes: {} }
);

export const AppSchema = new Schema({
  column: columnTable,
  item: itemTable,
});

export type Database = (typeof AppSchema)["types"];
