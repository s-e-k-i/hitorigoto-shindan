import { Resend } from "resend";
import { businessTypes } from "@/lib/businessTypes";
import { DiagnosisResult } from "@/types";

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
  featured: boolean
): string {
  const bt = businessTypes.find((b) => b.id === typeId);
  if (!bt) return "";
  // featured（ネイビー背景）は白系テキスト、通常は指定カラーを使用
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
    <div style="margin-top:10px;border-left:3px solid #d4a017;padding-left:10px;font-size:12px;color:${commentColor};line-height:1.75;">
      <strong style="color:#d4a017;display:block;margin-bottom:4px;">関達也のコメント</strong>
      「${bt.sekiComment}」
    </div>
  </div>`;
}

function buildResultHtml(lastName: string, result: DiagnosisResult): string {
  const adviceRows = result.advice
    .map(
      (adv, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start;">
      <span style="flex-shrink:0;width:26px;height:26px;background:#d4a017;color:#1e3a5f;border-radius:50%;display:inline-block;text-align:center;line-height:26px;font-size:13px;font-weight:bold;">${i + 1}</span>
      <p style="font-size:14px;color:#ffffff;line-height:1.75;margin:0;">${adv}</p>
    </div>`
    )
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
      <p style="color:#93c5fd;font-size:13px;margin:0;">独立31年・関達也監修</p>
    </div>

    <!-- 本文 -->
    <div style="padding:28px 24px;">
      <p style="font-size:16px;color:#1e3a5f;font-weight:bold;margin:0 0 6px;">${lastName}さん、診断結果が届きました！</p>
      <p style="font-size:13px;color:#555555;margin:0 0 24px;">あなたに向いているひとりビジネスタイプのTOP3と、関達也からの個別アドバイスをお届けします。</p>

      <!-- 診断結果 1〜3位 -->
      <h2 style="font-size:16px;color:#1e3a5f;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">診断結果</h2>
      ${rankBlock("🏆 1位", result.rank1.typeId, result.rank1.reason, true)}
      ${rankBlock("2位", result.rank2.typeId, result.rank2.reason, false)}
      ${rankBlock("3位", result.rank3.typeId, result.rank3.reason, false)}

      <!-- 関達也からのアドバイス -->
      <div style="background:#1e3a5f;border-radius:12px;padding:24px;margin:24px 0;">
        <h2 style="color:#ffffff;font-size:16px;margin:0 0 18px;font-weight:bold;">関達也からの3つのアドバイス</h2>
        ${adviceRows}
      </div>

      <!-- 個別相談CTA -->
      <div style="text-align:center;background:#fffbeb;border:2px solid #d4a017;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="font-size:16px;font-weight:bold;color:#1e3a5f;margin:0 0 8px;">次のステップ：個別相談</p>
        <p style="font-size:13px;color:#333333;margin:0 0 18px;line-height:1.7;">
          診断結果をもとに、あなたに最適なスタートプランを<br>関達也が直接アドバイスします。
        </p>
        <a href="https://sekitatsuya.com/spot-consulting/" style="display:inline-block;background:#d4a017;color:#ffffff;font-size:14px;font-weight:bold;padding:13px 32px;border-radius:8px;text-decoration:none;">
          個別相談はこちら →
        </a>
      </div>

      <!-- プロフィール -->
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
        <p style="font-size:13px;font-weight:bold;color:#1e3a5f;margin:0 0 8px;">関達也 プロフィール</p>
        <p style="font-size:12px;color:#555555;line-height:1.85;margin:0;">
          1994年、24歳で独立。飲食・物販・サービス業・教育事業など11種のひとりビジネスを実践。
          ドロップシッピング初年4,645万円、教材販売8,400万円超、メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。
          「せき塾」「MIB」など3,000名以上のひとり起業家を直接サポート。
        </p>
      </div>
    </div>

    <!-- フッター -->
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">このメールは「ひとりビジネス適性診断」からお送りしています。</p>
    </div>

  </div>
</body>
</html>`;
}

// 管理者（ADMIN_EMAIL）宛の通知メール：ユーザー情報＋診断結果を一覧表示
function buildAdminNotificationHtml(
  lastName: string,
  userEmail: string,
  result: DiagnosisResult
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
    const { lastName, email, result } = (await request.json()) as {
      lastName: string;
      email: string;
      result: DiagnosisResult;
    };

    if (!lastName || !email || !result) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // ドメイン未検証中は ADMIN_EMAIL 宛に診断結果＋ユーザー情報を転送する
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: "ひとりビジネス適性診断 <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `【新規リード】${lastName}さんが診断を完了しました`,
        html: buildAdminNotificationHtml(lastName, email, result),
      }),
      SEND_TIMEOUT_MS
    );

    if (error) {
      console.error(`[send-email] Failed to send to ${ADMIN_EMAIL}:`, error);
    } else {
      console.info(`[send-email] Notification sent to ${ADMIN_EMAIL} (id: ${data?.id})`);
    }

    // フロントには常に成功を返す（リード取得が主目的）
    return Response.json({ success: true, notified: !error });
  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return Response.json({ error: "メール送信中にエラーが発生しました" }, { status: 500 });
  }
}
