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

export async function GET(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await redis.lrange("users", 0, -1);
  const users = raw.map((item, index) => {
    const u = typeof item === "string" ? JSON.parse(item) : item;
    return { ...u, _index: index };
  });

  return Response.json({ users });
}

// 指定インデックスのエントリを downloaded=true に更新する
export async function PATCH(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { indices } = (await request.json()) as { indices: number[] };
  if (!Array.isArray(indices) || indices.length === 0) {
    return Response.json({ success: true });
  }

  const raw = await redis.lrange("users", 0, -1);
  await Promise.all(
    indices.map((idx) => {
      const u = typeof raw[idx] === "string" ? JSON.parse(raw[idx] as string) : raw[idx];
      return redis.lset("users", idx, JSON.stringify({ ...u, downloaded: true }));
    })
  );

  return Response.json({ success: true });
}
