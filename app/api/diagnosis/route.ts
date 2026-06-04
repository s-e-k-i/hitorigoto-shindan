import Anthropic from "@anthropic-ai/sdk";
import { businessTypes } from "@/lib/businessTypes";
import { Answers } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは「ひとりビジネス適性診断」のAIアドバイザーです。
独立31年、3,000名以上をサポートしてきた関達也の知見を元に診断します。

診断可能なビジネスタイプ（typeIdで指定）:
${businessTypes.map((bt) => `${bt.id}: ${bt.name}（${bt.description}）`).join("\n")}

ユーザーの回答を分析し、以下のJSON形式のみを出力してください。
JSON以外のテキストは一切出力しないこと。

{
  "rank1": { "typeId": 数字, "reason": "理由（2〜3文）" },
  "rank2": { "typeId": 数字, "reason": "理由（2〜3文）" },
  "rank3": { "typeId": 数字, "reason": "理由（2〜3文）" },
  "advice": ["具体的なアドバイス1", "具体的なアドバイス2", "具体的なアドバイス3"]
}

アドバイスの条件:
- ユーザーの状況・目標・制約に合わせた実践的な内容
- 「まず最初にやるべきこと」を具体的に
- 関達也が直接語りかけるような温かみのある口調で
- 3つとも異なる視点（最初の一歩 / 継続のコツ / 長期的な視点）で`;

export async function POST(request: Request) {
  try {
    const answers: Answers = await request.json();

    const userMessage = `ユーザーの回答:
Q1（現在の状況）: ${answers["q1"] ?? "未回答"}
Q2（職種）: ${answers["q2_choice"] ?? "未回答"}${answers["q2_text"] ? `（詳細: ${answers["q2_text"]}）` : ""}
Q3（得意なこと）: ${answers["q3_choice"] ?? "未回答"}${answers["q3_text"] ? `（詳細: ${answers["q3_text"]}）` : ""}
Q4（収入目標）: ${answers["q4"] ?? "未回答"}
Q5（求めるもの）: ${answers["q5"] ?? "未回答"}
Q6（場所・時間）: ${answers["q6"] ?? "未回答"}
Q7（初期資金）: ${answers["q7"] ?? "未回答"}
Q8（月間予算）: ${answers["q8"] ?? "未回答"}
Q9（使える時間）: ${answers["q9"] ?? "未回答"}
Q10（顔出し・実名）: ${answers["q10"] ?? "未回答"}
Q11（人との関わり）: ${answers["q11"] ?? "未回答"}
Q12（AI・デジタル）: ${answers["q12"] ?? "未回答"}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ error: "Unexpected response" }, { status: 500 });
    }

    const result = JSON.parse(content.text.trim());
    return Response.json(result);
  } catch (err) {
    console.error("Diagnosis API error:", err);
    return Response.json(
      { error: "診断中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
