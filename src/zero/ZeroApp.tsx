import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from "./schema";
import Board from "./Board";
import { createMutators } from "./mutators";
import Dump from "./Dump";

const serverURL = import.meta.env.VITE_ZERO_SERVER;
if (!serverURL) {
  throw new Error("VITE_ZERO_SERVER is not defined");
}

const z = new Zero({
  schema,
  userID: "anon",
  server: serverURL,
  mutators: createMutators(),
});

export default function ZeroApp({ content }: { content: "board" | "dump" }) {
  return (
    <ZeroProvider zero={z}>
      {content === "board" ? <Board /> : <Dump />}
    </ZeroProvider>
  );
}
