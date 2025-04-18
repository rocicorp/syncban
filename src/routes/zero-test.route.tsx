import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/zero-test")({
  component: RouteComponent,
});

const ZeroApp = lazy(() => import("../zero/ZeroApp"));

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <ZeroApp content="dump" />
    </Suspense>
  );
}
