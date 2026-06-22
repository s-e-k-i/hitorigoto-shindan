import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { businessTypes } from "@/lib/businessTypes";
import { DiagnosisResult } from "@/types";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// ドメイン未検証中は ADMIN_EMAIL 宛に全メールを転送する
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tatsu7676@gmail.com";
const SEND_TIMEOUT_MS = 30_000;

// Promise にタイムアウトを付与するヘルパー
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Resend timeout after ${ms}ms`)), ms)
    ),
  ]);
}

function rankBlock(
  label: string,
  typeId: number,
  reason: string,
  featured: boolean,
  sekiComment?: string
): string {
  const bt = businessTypes.find((b) => b.id === typeId);
  if (!bt) return "";
  const bg          = featured ? "#1e3a5f" : "#ffffff";
  const border      = featured ? "none" : "1px solid #e5e7eb";
  const nameColor   = featured ? "#ffffff" : "#1e3a5f";
  const descColor   = featured ? "#c8dcf8" : "#555555";
  const bodyColor   = featured ? "#ffffff" : "#333333";
  const scoreColor  = featured ? "#c8dcf8" : "#555555";
  const scoreBg     = featured ? "rgba(255,255,255,0.12)" : "#f5f5f5";
  const commentColor= featured ? "#ffffff" : "#333333";
  const badgeBg     = featured ? "#d4a017" : "#e5e7eb";
  const badgeColor  = featured ? "#1e3a5f" : "#333333";
  // AI生成のsekiCommentがあれば優先、なければ固定コメントをフォールバック
  const displayComment = sekiComment ?? bt.sekiComment;
  return `
  <div style="background:${bg};border:${border};border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="margin-bottom:10px;">
      <span style="background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:bold;padding:3px 10px;border-radius:20px;margin-right:8px;">${label}</span>
      <span style="font-size:18px;font-weight:bold;color:${nameColor};">${bt.name}</span>
    </div>
    <p style="font-size:13px;color:${descColor};margin:0 0 8px;">${bt.description}</p>
    <p style="font-size:14px;color:${bodyColor};line-height:1.75;margin:0 0 12px;">${reason}</p>
    <div style="background:${scoreBg};border-radius:8px;padding:10px;font-size:12px;color:${scoreColor};">
      即金性：${bt.immediacy}　参入条件：${bt.entryBar}　スケール性：${bt.scalability}
    </div>
    <div style="margin-top:12px;background:${scoreBg};border-radius:8px;padding:12px;">
      <p style="font-size:12px;font-weight:bold;color:${featured ? "#d4a017" : "#1e3a5f"};margin:0 0 6px;">おすすめのビジネス例</p>
      <p style="font-size:13px;color:${bodyColor};line-height:1.75;margin:0;">${bt.businessExamples}</p>
    </div>
    <div style="margin-top:10px;background:${scoreBg};border-radius:8px;padding:12px;">
      <p style="font-size:12px;font-weight:bold;color:${featured ? "#d4a017" : "#1e3a5f"};margin:0 0 6px;">最初にやること</p>
      <p style="font-size:13px;color:${bodyColor};line-height:1.75;margin:0;">${bt.firstStep}</p>
    </div>
    <div style="margin-top:10px;background:${scoreBg};border-radius:8px;padding:12px;">
      <p style="font-size:12px;font-weight:bold;color:${featured ? "#d4a017" : "#1e3a5f"};margin:0 0 6px;">つまずきやすい点</p>
      <p style="font-size:13px;color:${bodyColor};line-height:1.75;margin:0;">${bt.pitfall}</p>
    </div>
    <div style="margin-top:10px;background:${scoreBg};border-radius:8px;padding:12px;">
      <p style="font-size:12px;font-weight:bold;color:${featured ? "#d4a017" : "#1e3a5f"};margin:0 0 8px;">アドバイス</p>
      <ol style="margin:0;padding-left:18px;font-size:13px;color:${bodyColor};line-height:1.8;">
        ${bt.adviceList.map((adv) => `<li style="margin-bottom:4px;">${adv}</li>`).join("")}
      </ol>
    </div>
    <div style="margin-top:10px;border-left:3px solid #d4a017;padding-left:10px;font-size:12px;color:${commentColor};line-height:1.75;">
      <strong style="color:#d4a017;display:block;margin-bottom:4px;">関達也のコメント</strong>
      ${displayComment}
    </div>
  </div>`;
}

function buildResultHtml(lastName: string, result: DiagnosisResult): string {
  const adviceRows = result.advice
    .map((adv, i) => {
      const text = adv.replace(/^[①②③1-9０-９][.．。）\)]\s*/, "").trim();
      return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;width:100%;">
      <tr>
        <td style="width:36px;vertical-align:top;padding-top:2px;">
          <div style="width:28px;height:28px;background:#d4a017;border-radius:50%;color:white;font-weight:bold;font-size:13px;text-align:center;line-height:28px;">${i + 1}</div>
        </td>
        <td style="vertical-align:top;padding-left:8px;font-size:14px;color:#ffffff;line-height:1.75;">
          ${text}
        </td>
      </tr>
    </table>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>ひとりビジネス適性診断 結果</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">

    <!-- ヘッダー -->
    <div style="background:#1e3a5f;padding:30px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:20px;margin:0 0 6px;font-weight:bold;">ひとりビジネス適性診断</h1>
      <p style="color:#93c5fd;font-size:13px;margin:0;">ひとり起業コンサル・関達也監修｜独立31年・3,000名以上をサポート</p>
    </div>

    <!-- 本文 -->
    <div style="padding:28px 24px;">
      <p style="font-size:16px;color:#1e3a5f;font-weight:bold;margin:0 0 6px;">${lastName}さん、診断結果が届きました！</p>
      <p style="font-size:13px;color:#555555;margin:0 0 24px;">あなたに向いているひとりビジネスタイプのTOP3と、関達也からの個別アドバイスをお届けします。</p>

      <!-- 診断結果 1〜3位 -->
      <h2 style="font-size:16px;color:#1e3a5f;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">診断結果</h2>
      ${rankBlock("🏆 1位", result.rank1.typeId, result.rank1.reason, true, result.rank1.sekiComment)}
      ${rankBlock("2位", result.rank2.typeId, result.rank2.reason, false, result.rank2.sekiComment)}
      ${rankBlock("3位", result.rank3.typeId, result.rank3.reason, false, result.rank3.sekiComment)}

      <!-- 関達也からのアドバイス（AI生成） -->
      <div style="background:#1e3a5f;border-radius:12px;padding:24px;margin:24px 0;">
        <h2 style="color:#ffffff;font-size:16px;margin:0 0 18px;font-weight:bold;">関達也からの3つのアドバイス</h2>
        ${adviceRows}
      </div>

      ${process.env.NEXT_PUBLIC_SHOW_CONSULTING !== "false" ? `
      <!-- 個別相談 -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="font-size:13px;font-weight:bold;color:#374151;margin:0 0 6px;line-height:1.8;">診断結果を読んで、「自分の場合は具体的にどう動けばいいんだろう」と感じた方へ。</p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px;line-height:1.8;">あなたの状況に合わせて、一緒に整理します。</p>
        <a href="https://sekitatsuya.com/mail/hitoribiz-shindan-m" style="display:inline-block;background:#334155;color:#ffffff;font-size:13px;font-weight:bold;padding:10px 24px;border-radius:8px;text-decoration:none;">個別相談の詳細を見る</a>
      </div>` : ""}

      <!-- プロフィール -->
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
        <p style="font-size:13px;font-weight:bold;color:#1e3a5f;margin:0 0 8px;">監修者：関達也（ひとり起業コンサル）</p>
        <p style="font-size:12px;color:#555555;line-height:1.85;margin:0;">
          24歳で独立して31年。物販・サービス業・教育事業など11種のビジネスを実践。PC1台のひとりビジネスで1億円を達成。メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。3,000名以上を直接サポートしてきた関達也が設計した診断です。
        </p>
      </div>
    </div>

    <!-- メルマガ案内 -->
    <div style="background:#f0f7ff;border-top:1px solid #dbeafe;padding:20px 24px;">
      <p style="font-size:12px;color:#555555;margin:8px 0;">本メールは、ひとりビジネス適性診断にご登録いただいた方にお送りしています。</p>
      <p style="font-size:12px;color:#555555;margin:8px 0;">関達也の無料メールマガジンでは、ひとり起業に役立つ情報を定期的にお届けします。</p>
      <p style="font-size:12px;color:#555555;margin:8px 0;">引き続きよろしくお願いいたします。</p>
      <p style="font-size:12px;color:#555555;margin:16px 0 4px;">診断の感想・ご質問・ご相談はお気軽にどうぞ。<br>
        <a href="mailto:info@sekitatsuya.com" style="color:#1e3a5f;">info@sekitatsuya.com</a>
      </p>
      <p style="font-size:12px;color:#555555;margin:8px 0;">
        ひとりビジネス適性診断はこちら<br>
        <a href="https://hitoribusiness-shindan.vercel.app" style="color:#1e3a5f;">https://hitoribusiness-shindan.vercel.app</a>
      </p>
    </div>

    <!-- フッター -->
    <div style="background:#f9fafb;padding:14px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">このメールは「ひとりビジネス適性診断」からお送りしています。</p>
    </div>

  </div>
</body>
</html>`;
}

const Q_LABELS: Record<string, string> = {
  q1:       "Q1. 今の状況",
  q2_choice:"Q2. 現在の仕事・職種",
  q2_text:  "Q2. 職種の詳細",
  q3_choice:"Q3. 得意なこと",
  q3_text:  "Q3. 得意の詳細",
  q4:       "Q4. 収入の目標",
  q5:       "Q5. ビジネスに求めるもの",
  q6:       "Q6. 場所・時間の自由",
  q7:       "Q7. 初期資金",
  q8:       "Q8. 月々の予算",
  q9:       "Q9. 週の使える時間",
  q10:      "Q10. 顔出し・実名",
  q11:      "Q11. 人との関わり",
  q12:      "Q12. AIへの関心",
};

const Q_ORDER = [
  "q1",
  "q2_choice","q2_text",
  "q3_choice","q3_text",
  "q4","q5","q6","q7","q8","q9","q10","q11","q12",
];

// 管理者（ADMIN_EMAIL）宛の通知メール：ユーザー情報＋診断結果を一覧表示
function buildAdminNotificationHtml(
  lastName: string,
  userEmail: string,
  result: DiagnosisResult,
  answers: Record<string, string>
): string {
  const r1 = businessTypes.find((b) => b.id === result.rank1.typeId);
  const r2 = businessTypes.find((b) => b.id === result.rank2.typeId);
  const r3 = businessTypes.find((b) => b.id === result.rank3.typeId);

  const adviceRows = result.advice
    .map((adv, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 4px;color:#555555;width:8%;font-weight:bold;">${i + 1}</td>
      <td style="padding:10px 4px;color:#333333;">${adv}</td>
    </tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <!-- ヘッダー -->
  <div style="background:#1e3a5f;padding:20px 24px;">
    <h1 style="color:#ffffff;font-size:18px;margin:0 0 4px;font-weight:bold;">📩 新規リード通知</h1>
    <p style="color:#93c5fd;font-size:12px;margin:0;">ひとりビジネス適性診断</p>
  </div>

  <div style="padding:24px;">

    <!-- ユーザー情報 -->
    <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">ユーザー情報</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 4px;color:#555555;width:35%;">お名前（姓）</td>
        <td style="padding:10px 4px;font-weight:bold;color:#333333;">${lastName}さん</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 4px;color:#555555;">メールアドレス</td>
        <td style="padding:10px 4px;font-weight:bold;">
          <a href="mailto:${userEmail}" style="color:#1e3a5f;">${userEmail}</a>
        </td>
      </tr>
    </table>

    <!-- 診断結果 TOP3 -->
    <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">診断結果 TOP3</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #e5e7eb;background:#fffbeb;">
        <td style="padding:10px 4px;width:15%;"><span style="background:#d4a017;color:#1e3a5f;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:20px;">🏆 1位</span></td>
        <td style="padding:10px 4px;font-weight:bold;color:#1e3a5f;">${r1?.name ?? "不明"}</td>
        <td style="padding:10px 4px;color:#555555;font-size:13px;">${result.rank1.reason}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 4px;"><span style="background:#e5e7eb;color:#333333;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:20px;">2位</span></td>
        <td style="padding:10px 4px;font-weight:bold;color:#333333;">${r2?.name ?? "不明"}</td>
        <td style="padding:10px 4px;color:#555555;font-size:13px;">${result.rank2.reason}</td>
      </tr>
      <tr>
        <td style="padding:10px 4px;"><span style="background:#e5e7eb;color:#333333;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:20px;">3位</span></td>
        <td style="padding:10px 4px;font-weight:bold;color:#333333;">${r3?.name ?? "不明"}</td>
        <td style="padding:10px 4px;color:#555555;font-size:13px;">${result.rank3.reason}</td>
      </tr>
    </table>

    <!-- 診断回答 -->
    <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">診断回答（全15問）</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
      ${Q_ORDER
        .filter((key) => answers[key])
        .map((key, idx, arr) => {
          const isLast = idx === arr.length - 1;
          return `<tr style="border-bottom:${isLast ? "none" : "1px solid #e5e7eb"};">
            <td style="padding:9px 6px;color:#555555;width:36%;vertical-align:top;white-space:nowrap;">${Q_LABELS[key] ?? key}</td>
            <td style="padding:9px 6px;color:#333333;">${answers[key]}</td>
          </tr>`;
        })
        .join("")}
    </table>

    <!-- タイプ詳細（1〜3位） -->
    <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">診断タイプ詳細（1〜3位）</h2>
    ${[
      { rank: "🏆 1位", bt: r1, rankResult: result.rank1 },
      { rank: "2位",    bt: r2, rankResult: result.rank2 },
      { rank: "3位",    bt: r3, rankResult: result.rank3 },
    ].map(({ rank, bt, rankResult }) => bt ? `
    <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#1e3a5f;padding:10px 14px;">
        <span style="color:#d4a017;font-size:11px;font-weight:bold;margin-right:8px;">${rank}</span>
        <span style="color:#ffffff;font-size:14px;font-weight:bold;">${bt.name}</span>
      </div>
      <div style="padding:14px;font-size:13px;">
        <p style="margin:0 0 8px;font-size:12px;color:#555555;">即金性：${bt.immediacy}　参入条件：${bt.entryBar}　スケール性：${bt.scalability}</p>
        <p style="margin:0 0 6px;"><strong style="color:#1e3a5f;">特徴：</strong><span style="color:#333333;">${bt.feature}</span></p>
        <p style="margin:0 0 10px;"><strong style="color:#1e3a5f;">向いている理由：</strong><span style="color:#333333;">${bt.suitableReason}</span></p>
        <p style="margin:0 0 4px;"><strong style="color:#1e3a5f;">おすすめのビジネス例：</strong><span style="color:#333333;">${bt.businessExamples}</span></p>
        <p style="margin:0 0 4px;"><strong style="color:#1e3a5f;">最初にやること：</strong><span style="color:#333333;">${bt.firstStep}</span></p>
        <p style="margin:0 0 10px;"><strong style="color:#1e3a5f;">つまずきやすい点：</strong><span style="color:#333333;">${bt.pitfall}</span></p>
        <p style="margin:0 0 6px;font-weight:bold;color:#1e3a5f;">アドバイス：</p>
        <ol style="margin:0;padding-left:20px;color:#333333;margin-bottom:10px;">
          ${bt.adviceList.map((adv) => `<li style="margin-bottom:4px;">${adv}</li>`).join("")}
        </ol>
        <div style="background:#fffbeb;border-left:3px solid #d4a017;padding:10px 12px;border-radius:0 6px 6px 0;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#d4a017;">関達也のコメント</p>
          <p style="margin:0;color:#555555;line-height:1.7;">${rankResult.sekiComment ?? bt.sekiComment}</p>
        </div>
      </div>
    </div>` : "").join("")}

    <!-- アドバイス -->
    <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">関達也からの3つのアドバイス</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      ${adviceRows}
    </table>

    <!-- アクション -->
    <div style="background:#fffbeb;border:1px solid #d4a017;border-radius:8px;padding:16px;font-size:13px;color:#333333;">
      <strong style="color:#1e3a5f;">📌 アクション：</strong>
      <a href="mailto:${userEmail}" style="color:#1e3a5f;font-weight:bold;">${userEmail}</a>
      に直接ご連絡ください。
    </div>

  </div>

  <div style="background:#f9fafb;padding:14px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:11px;color:#9ca3af;margin:0;">ひとりビジネス適性診断 管理通知</p>
  </div>
</div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { lastName, email, result, answers = {} } = (await request.json()) as {
      lastName: string;
      email: string;
      result: DiagnosisResult;
      answers?: Record<string, string>;
    };

    if (!lastName || !email || !result) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const FROM = "ひとりビジネス適性診断（関達也） <info@sekitatsuya.com>";

    // ① ユーザーへ診断結果メールを送信
    const { data: userData, error: userError } = await withTimeout(
      resend.emails.send({
        from: FROM,
        to: [email],
        replyTo: 'info@sekitatsuya.com',
        subject: `【診断結果】${lastName}さんに向いているひとりビジネスタイプが届きました`,
        html: buildResultHtml(lastName, result),
      }),
      SEND_TIMEOUT_MS
    );

    if (userError) {
      console.error(`[send-email] Failed to send to user ${email}:`, userError);
    } else {
      console.info(`[send-email] Result sent to ${email} (id: ${userData?.id})`);
    }

    // ② 管理者へリード通知メールを送信（並行）
    const { data: adminData, error: adminError } = await withTimeout(
      resend.emails.send({
        from: FROM,
        to: [ADMIN_EMAIL],
        replyTo: 'info@sekitatsuya.com',
        subject: `【診断完了】${lastName}さんが診断を受けました`,
        html: buildAdminNotificationHtml(lastName, email, result, answers),
      }),
      SEND_TIMEOUT_MS
    );

    if (adminError) {
      console.error(`[send-email] Failed to send to admin ${ADMIN_EMAIL}:`, adminError);
    } else {
      console.info(`[send-email] Notification sent to ${ADMIN_EMAIL} (id: ${adminData?.id})`);
    }

    // ③ KVにユーザーデータを保存
    try {
      const rank1Type = businessTypes.find((b) => b.id === result.rank1.typeId);
      await redis.lpush("users", JSON.stringify({
        name: lastName,
        email,
        registeredAt: new Date().toISOString(),
        typeName: rank1Type?.name ?? "不明",
      }));
    } catch (kvErr) {
      console.error("[send-email] KV save failed:", kvErr);
    }

    // フロントには常に成功を返す（リード取得が主目的）
    return Response.json({ success: true, emailSent: !userError, adminNotified: !adminError });
  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return Response.json({ error: "メール送信中にエラーが発生しました" }, { status: 500 });
  }
}
