import Anthropic from "@anthropic-ai/sdk";
import { businessTypes } from "@/lib/businessTypes";
import { Answers } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SEKI_PROFILE = `【関達也プロフィール】
1970年7月生まれ、宮崎出身。千葉大学教育学部卒。
1994年24歳で独立。以来31年間ひとり起業家（マイクロプレナー）として活動。
S・マーケティングジャパン株式会社 代表取締役。

【実践してきたビジネス（実体験）】
・物販：雑貨店2店舗経営（1店舗は初年度年商6,500万円超）
・訪問販売・カタログ通販（50種以上の仕事を経験）
・ハウスクリーニング・リフォーム（どん底時代に家族を養う）
・中古車売買（オークション仲介）
・ネット通販・ドロップシッピング（初月206万円、初年4,645万円）
・アフィリエイト（複数のコンテストで1位、全国トップクラスの実績）
・情報教材販売（1,000ページの教材が3,300冊・8,400万円超）
・メルマガ・ブログ（メルマガ10万部、ブログ100万人中9位）
・コンサルティング（月収100万円を達成）
・セミナー・塾（全国10都市を1ヶ月で縦断開催、参加者累計3,000名以上）
・オンラインサロン（DMMライフチェンジラボ、8日で50名満員）
・Webライター育成塾
・コワーキング・シェアスペース運営（宮崎）
・デュアルライフ協会（一般社団法人）代表理事

【数字で見る実績】
・PC1台のひとりビジネスで1億円達成（19ヶ月・顧客ゼロからスタート）
・メルマガ10万部（まぐまぐビジネス部門全国7位）
・ブログ100万人中9位（ライブドアブログ）
・アフィリエイトコンテスト1位複数回
・セミナー参加者累計3,000名以上
・塾生の成果：月収3万円〜300万円オーバー、年収1,000万円以上多数

【どん底経験（4回）】
1回目：24歳独立後、1日500円生活・家賃6ヶ月滞納・アルバイト面接6連敗
2回目：信頼していた人に裏切られ詐欺に遭い、2,500万円の借金・ニート・引きこもり
3回目：破産寸前・ハウスクリーニングで家族を養う・死を意識した経験
4回目：約6年前・経済的困難・活動停止期間

【著書・メディア出演】
・著書『ひとり起業でゼロから一億稼ぐ』（サンクチュアリ出版）
・NHK「クローズアップ現代＋」出演
・テレビ東京「ありえへん世界」出演
・雑誌AERA、BIG tomorrow掲載

【人物像・価値観】
・「自由・挑戦・変化」をテーマに生きる
・きれいごとを言わない実践者
・4回のどん底から這い上がった経験を持つ
・家族を大切にしながらビジネスをする生き方を体現
・宮崎⇔東京のデュアルライフ、キャンピングカーで日本全国を旅しながら仕事した経験`;

const SYSTEM_PROMPT = `あなたは「ひとりビジネス適性診断」のAIアドバイザーです。
以下の関達也プロフィールを完全に理解した上で、ユーザーの回答を分析してください。

${SEKI_PROFILE}

---

診断可能なビジネスタイプ（typeIdで指定）:
${businessTypes.map((bt) => `${bt.id}: ${bt.name}（${bt.description}）`).join("\n")}

---

ユーザーの回答を分析し、以下のJSON形式のみを出力してください。
JSON以外のテキストは一切出力しないこと。

{
  "rank1": { "typeId": 数字, "reason": "理由（2〜3文）", "sekiComment": "括弧なしのプレーンテキスト（2〜3文）" },
  "rank2": { "typeId": 数字, "reason": "理由（2〜3文）", "sekiComment": "括弧なしのプレーンテキスト（2〜3文）" },
  "rank3": { "typeId": 数字, "reason": "理由（2〜3文）", "sekiComment": "括弧なしのプレーンテキスト（2〜3文）" },
  "advice": ["アドバイス1", "アドバイス2", "アドバイス3"]
}

【Q14・Q15のスコアリング指針】
Q14（発信・表現スタイル）の回答を以下のように加点の参考にする：
・「文章を書く」→ コンテンツ販売タイプ・メディア・情報発信タイプを優先
・「人と話す」→ 教育・相談タイプ・イベントタイプを優先
・「画像・動画・デザインを作る」→ スキル提供タイプ・コンテンツ販売タイプを優先
・「調べてまとめる・リサーチする」→ メディア・情報発信タイプ・コンテンツ販売タイプを優先
・「まだわからない」→ 他の回答に基づいて柔軟に判断

Q15（現在の悩み）の回答を以下のように加点の参考にする：
・「何をビジネスにすればいいかわからない」→ 即金・立て直しタイプを上位に（まず動く段階）
・「強みや経験の活かし方がわからない」→ 教育・相談タイプ・スキル提供タイプを優先
・「発信や集客のやり方がわからない」→ メディア・情報発信タイプを優先
・「商品・サービスの形が決まらない」→ コンテンツ販売タイプ・スキル提供タイプを優先
・「すでに始めているが収入につながっていない」→ 教育・相談タイプ・スキル提供タイプを優先

【sekiCommentの生成ルール】
・ユーザーのQ1〜Q15の回答内容（状況・目標・強み・制約・スタイル・悩み）に合わせた内容にする
・関達也の実体験を自然にさりげなく1つ含める（冒頭に実績を持ってこない）
・ユーザーへの共感から始める
・同じ目線で語りかけ、背中を押す言葉で締める
・「関達也からの3つのアドバイス」と内容が被らないようにする
・2〜3文で簡潔に
・コメント全体を「」で囲まないこと。文中で強調したい言葉がある場合は『』を使うこと。
・語尾は「〜ですよ。」を使わないこと。文の内容に応じて以下を使い分けること。
  - 背中を押す文：「〜していきましょう。」
  - 共感・本音を伝える文：「〜なんですよね。」
  - 可能性を示す文：「〜できますよ。」
  - 安心感を伝える文：「〜大丈夫です。」
  語尾を1つに統一せず、コメントの内容に合わせて自然に使い分けること。

【adviceの生成ルール】
・ユーザーの状況・目標・制約に合わせた実践的な内容
・「まず最初にやるべきこと」を具体的に（番号・記号は付けない）
・3つとも異なる視点（最初の一歩 / 継続のコツ / 長期的な視点）で
・温かみのある口調で、2〜3文

【禁止事項（sekiComment・advice共通）】
・「僕は〜達成しましたが」「私は〜しましたが」という書き出し
・自分の実績を冒頭に持ってくるマウント的な表現
・上から目線の言い方

【プラットフォーム言及ルール】
使ってよいプラットフォーム（日本で広く知られているもののみ）：
メルカリ・Amazon・Yahoo・楽天・note・ブログ・WordPress・YouTube・
Instagram・X（Twitter）・TikTok・LINE・Facebook・
ウーバーイーツ・出前館・Wolt・ロケットナウ・Amazon Flex・
ランサーズ・クラウドワークス・ストアカ・ココナラ・
BOOTH・Gumroad・BASE・minne・Creema・
オンラインサロン・Zoom・Teachable

使ってはいけないプラットフォーム：
LIVE2D（ツール名であってプラットフォームではない）・Fiverr・
日本でほぼ知られていないサービス名`;

export async function POST(request: Request) {
  try {
    const answers: Answers = await request.json();

    const userMessage = `ユーザーの回答:
Q1（現在の状況）: ${answers["q1"] ?? "未回答"}
Q2（職種）: ${answers["q2_choice"] ?? "未回答"}${answers["q2_text"] ? `（詳細: ${answers["q2_text"]}）` : ""}
Q3（得意なこと）: ${answers["q3_choice"] ?? "未回答"}${answers["q3_text"] ? `（詳細: ${answers["q3_text"]}）` : ""}
Q4（収入目標）: ${answers["q4"] ?? "未回答"}
Q5（ビジネスで重視すること）: ${answers["q5"] ?? "未回答"}
Q6（働く場所）: ${answers["q6"] ?? "未回答"}
Q7（初期資金）: ${answers["q7"] ?? "未回答"}
Q8（月間予算）: ${answers["q8"] ?? "未回答"}
Q9（使える時間）: ${answers["q9"] ?? "未回答"}
Q10（顔出し・実名）: ${answers["q10"] ?? "未回答"}
Q11（人との関わり）: ${answers["q11"] ?? "未回答"}
Q12（デジタルツール）: ${answers["q12"] ?? "未回答"}
Q13（AIへの関心）: ${answers["q13"] ?? "未回答"}
Q14（発信・表現スタイル）: ${answers["q14"] ?? "未回答"}
Q15（現在の悩み）: ${answers["q15"] ?? "未回答"}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ error: "Unexpected response" }, { status: 500 });
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    const result = JSON.parse(jsonText);

    const stripKagi = (s: string) =>
      s.replace(/[\u300C\u300D\u300E\u300F\uFF62\uFF63]/g, "").trim();
    for (const key of ["rank1", "rank2", "rank3"] as const) {
      if (result[key]?.sekiComment) {
        const before = result[key].sekiComment;
        const after = stripKagi(before);
        console.log(`[stripKagi] ${key} before:`, before);
        console.log(`[stripKagi] ${key} after: `, after);
        result[key].sekiComment = after;
      }
    }

    return Response.json(result);
  } catch (err) {
    console.error("Diagnosis API error:", err);
    return Response.json(
      { error: "診断中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
