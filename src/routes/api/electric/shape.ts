import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/electric/shape")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const p = new URLSearchParams(url.searchParams);

    // Add our source credentials
    p.append("source_id", "dddaf990-444f-47c5-86c6-e5a9a6845469");
    p.append(
      "source_secret",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJkZGRhZjk5MC00NDRmLTQ3YzUtODZjNi1lNWE5YTY4NDU0NjkiLCJpYXQiOjE3NDQ1MTE2MDZ9.GQ_p-2GEV3meUX8KA2hvsW3DGiOXUEBRNxRQTCVxiM4"
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
