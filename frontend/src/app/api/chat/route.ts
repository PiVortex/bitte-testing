import type { NextRequest } from "next/server";

const { BITTE_API_KEY } = process.env;

if (!BITTE_API_KEY) {
  throw new Error("BITTE_API_KEY is not set");
}

const BITTE_API_URL = "https://wallet.bitte.ai/api/v1/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const POST = async (req: NextRequest): Promise<Response> => {
  const requestInit: RequestInit & { duplex: "half" } = {
    method: "POST",
    body: req.body,
    headers: {
      Authorization: `Bearer ${BITTE_API_KEY}`,
    },
    duplex: "half",
  };

  const upstreamResponse = await fetch(BITTE_API_URL, requestInit);
  const headers = new Headers(upstreamResponse.headers);
  headers.delete("Content-Encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}; 