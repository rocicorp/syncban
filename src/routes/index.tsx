import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { navigate } = useRouter();

  return (
    <div className="index-page">
      <h1 className="app-title">SyncBan</h1>
      <div className="ui-selector">
        <button
          onClick={() => navigate({ to: "/zero" })}
          className="ui-button zero"
        >
          Zero UI
        </button>
        <button
          onClick={() => navigate({ to: "/powersync" })}
          className="ui-button powersync"
        >
          PowerSync UI
        </button>
      </div>
    </div>
  );
}
