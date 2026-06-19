import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function authorize(request: Request): boolean {
  const auth = request.headers.get("Authorization") ?? "";
  const password = auth.replace("Bearer ", "");
  return !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
}

export async function DELETE(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { index } = (await request.json()) as { index: number };
  if (typeof index !== "number") {
    return Response.json({ error: "Invalid index" }, { status: 400 });
  }

  const sentinel = "__DELETED__";
  await redis.lset("users", index, sentinel);
  await redis.lrem("users", 1, sentinel);

  return Response.json({ success: true });
}
