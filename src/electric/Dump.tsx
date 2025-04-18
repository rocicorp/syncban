import { useShape } from "@electric-sql/react";
import { type Row } from "@electric-sql/client";

const shapeURL = import.meta.env.VITE_ELECTRIC_SHAPE_URL + "&cb=" + Date.now();
if (!shapeURL) {
  throw new Error("VITE_ELECTRIC_SHAPE_URL is not defined");
}

export default function ElectricDump() {
  const itemShape = {
    url: shapeURL,
    params: {
      table: "item",
    },
  };

  const items = useShape<Row<any>>(itemShape);

  return <pre>{JSON.stringify(items.data, null, "  ")}</pre>;
}
