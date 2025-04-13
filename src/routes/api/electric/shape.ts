import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/electric/shape")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const p = new URLSearchParams(url.searchParams);

    // Add our source credentials
    p.append("source_id", "cf8d67c8-bf4a-4eb3-badd-5af7341719ac");
    p.append(
      "source_secret",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJjZjhkNjdjOC1iZjRhLTRlYjMtYmFkZC01YWY3MzQxNzE5YWMiLCJpYXQiOjE3NDQyMzYwNzF9.uO06tfAbQkhEes8WgfAkIrbYKBifyPje7LGLCE2qGiU"
    );

    const originURL = "https://api.electric-sql.cloud/v1/shape?" + p.toString();

    // See https://github.com/wintercg/fetch/issues/23
    let resp = await fetch(originURL);
    if (resp.headers.get(`content-encoding`)) {
      const headers = new Headers(resp.headers);
      headers.delete(`content-encoding`);
      headers.delete(`content-length`);
      resp = new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers,
      });
    }
    return resp;
  },
});
