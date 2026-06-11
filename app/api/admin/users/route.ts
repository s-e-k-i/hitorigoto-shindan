import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization") ?? "";
  const password = auth.replace("Bearer ", "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await redis.lrange("users", 0, -1);
  const users = raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  return Response.json({ users });
}
