import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { navigate } = useRouter();

  return (
    <button
      // @ts-ignore
      onClick={() => navigate({ to: "/zero" })}
      className="ui-button zero"
    >
      Zero UI
    </button>
  );
}
