import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createFileRoute("/electric")({
  component: RouteComponent,
});

const queryClient = new QueryClient();

const Electric = lazy(() => import("../electric/Electric"));

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <Electric />
      </QueryClientProvider>
    </Suspense>
  );
}
