// 実行: 「即金・立て直しタイプ」→「即金フリータイプ」へ typeName を書き換える

import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  const env = {};
  const content = readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envPath = resolve(__dirname, "../.env.local");
const env = loadEnv(envPath);

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const OLD_NAME = "即金・立て直しタイプ";
const NEW_NAME = "即金フリータイプ";

// 全件取得
const raw = await redis.lrange("users", 0, -1);
const users = raw.map((item, index) => {
  const u = typeof item === "string" ? JSON.parse(item) : item;
  return { ...u, _index: index };
});

const targets = users.filter((u) => u.typeName === OLD_NAME);

if (targets.length === 0) {
  console.log("修正対象が0件です。処理を終了します。");
  process.exit(0);
}

console.log(`修正対象: ${targets.length} 件`);

// 1件ずつ lset で typeName のみ書き換え
for (const u of targets) {
  const { _index, ...rest } = u;
  const updated = { ...rest, typeName: NEW_NAME };
  await redis.lset("users", _index, JSON.stringify(updated));
  console.log(`[index ${_index}] ${u.name} (${u.email}) → typeName 更新完了`);
}

// 確認: 再取得して OLD_NAME が残っていないか検証
const rawAfter = await redis.lrange("users", 0, -1);
const remaining = rawAfter
  .map((item) => (typeof item === "string" ? JSON.parse(item) : item))
  .filter((u) => u.typeName === OLD_NAME);

console.log("");
console.log("=== 書き換え後の確認 ===");
console.log(`「${OLD_NAME}」残件数: ${remaining.length} 件`);

if (remaining.length === 0) {
  console.log("✓ 古いタイプ名は完全に消えました。");
} else {
  console.log("⚠ まだ残っているレコードがあります:");
  for (const u of remaining) console.log(JSON.stringify(u, null, 2));
}
