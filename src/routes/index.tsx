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
          className="ui-button brand zero"
        ></button>
        <button
          onClick={() => navigate({ to: "/powersync" })}
          className="ui-button brand powersync"
        ></button>
        <button
          onClick={() => navigate({ to: "/electric" })}
          className="ui-button brand electric"
        ></button>
      </div>
    </div>
  );
}
