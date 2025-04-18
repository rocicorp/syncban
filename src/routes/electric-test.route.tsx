import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createFileRoute("/electric-test")({
  component: RouteComponent,
});

const queryClient = new QueryClient();

const Dump = lazy(() => import("../electric/Dump"));

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <Dump />
      </QueryClientProvider>
    </Suspense>
  );
}
