// dry-run: 「即金・立て直しタイプ」→「即金フリータイプ」への修正対象を表示するだけ
// 実際のRedis書き込みは一切行わない

import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local を手動でパース（dotenv未導入のため）
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

const raw = await redis.lrange("users", 0, -1);
const users = raw.map((item, index) => {
  const u = typeof item === "string" ? JSON.parse(item) : item;
  return { ...u, _index: index };
});

const targets = users.filter((u) => u.typeName === OLD_NAME);

console.log("=== DRY-RUN: 修正対象の確認 ===");
console.log(`全登録者数: ${users.length} 件`);
console.log(`「${OLD_NAME}」該当件数: ${targets.length} 件`);
console.log("");

if (targets.length === 0) {
  console.log("修正対象は0件です。作業不要です。");
} else {
  console.log("--- 修正対象データ（書き換え前） ---");
  for (const u of targets) {
    console.log(JSON.stringify({
      _index: u._index,
      name: u.name,
      email: u.email,
      registeredAt: u.registeredAt,
      typeName: u.typeName,
      downloaded: u.downloaded,
    }, null, 2));
  }
  console.log("");
  console.log(`上記 ${targets.length} 件の typeName を`);
  console.log(`  「${OLD_NAME}」→「${NEW_NAME}」`);
  console.log("に変更します。問題なければ fix-typename-apply.mjs を実行してください。");
}
