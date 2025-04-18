import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/powersync")({
  component: RouteComponent,
});

const PowerSync = lazy(() => import("../powersync/PowerSync"));

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <PowerSync content="board" />
    </Suspense>
  );
}
