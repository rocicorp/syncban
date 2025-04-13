import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/electric")({
  component: RouteComponent,
});

const Electric = lazy(() => import("../electric/Electric"));

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <Electric />
    </Suspense>
  );
}
