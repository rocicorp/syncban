import {
  table,
  string,
  relationships,
  createSchema,
  definePermissions,
  PermissionsConfig,
  type Row,
  ANYONE_CAN_DO_ANYTHING,
} from "@rocicorp/zero";

const column = table("column")
  .columns({
    id: string(),
    name: string(),
    order: string(),
  })
  .primaryKey("id");

const item = table("item")
  .columns({
    id: string(),
    columnID: string().from("column_id"),
    title: string(),
    body: string(),
    order: string(),
  })
  .primaryKey("id");

const columnRelationships = relationships(column, ({ many }) => ({
  items: many({
    sourceField: ["id"],
    destSchema: item,
    destField: ["columnID"],
  }),
}));

const itemRelationships = relationships(item, ({ one }) => ({
  column: one({
    sourceField: ["columnID"],
    destSchema: column,
    destField: ["id"],
  }),
}));

export const schema = createSchema({
  tables: [column, item],
  relationships: [columnRelationships, itemRelationships],
});

export type Schema = typeof schema;
export type Column = Row<typeof schema.tables.column>;
export type Item = Row<typeof schema.tables.item>;

// The decoded value of your JWT.
type AuthData = Record<string, unknown>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {
    column: ANYONE_CAN_DO_ANYTHING,
    item: ANYONE_CAN_DO_ANYTHING,
  } satisfies PermissionsConfig<AuthData, Schema>;
});
