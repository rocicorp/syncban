import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from "./schema";
import Board from "./Board";

const serverURL = import.meta.env.VITE_ZERO_SERVER;
if (!serverURL) {
  throw new Error("VITE_ZERO_SERVER is not defined");
}

const z = new Zero({
  schema,
  userID: "anon",
  server: serverURL,
});

export default function ZeroApp() {
  return (
    <ZeroProvider zero={z}>
      <Board />
    </ZeroProvider>
  );
}
