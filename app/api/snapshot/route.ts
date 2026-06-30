import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface UserEntry {
  name: string;
  email: string;
  registeredAt: string;
  typeName: string;
  downloaded?: boolean;
}

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!process.env.SNAPSHOT_API_KEY || apiKey !== process.env.SNAPSHOT_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await redis.lrange("users", 0, -1);
  const users: UserEntry[] = raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  const type_breakdown: Record<string, number> = {};
  for (const u of users) {
    if (u.typeName) {
      type_breakdown[u.typeName] = (type_breakdown[u.typeName] ?? 0) + 1;
    }
  }

  const sorted = [...users].sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
  );
  const recent_registrations = sorted.slice(0, 10).map((u) => ({
    name: u.name,
    registeredAt: u.registeredAt,
    typeName: u.typeName,
  }));

  return Response.json({
    tool_name: "ひとりビジネス適性診断",
    total_registrations: users.length,
    recent_registrations,
    type_breakdown,
    last_updated: new Date().toISOString(),
  });
}
