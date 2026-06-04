import { Resend } from "resend";
import { businessTypes } from "@/lib/businessTypes";
import { DiagnosisResult } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildHtml(lastName: string, result: DiagnosisResult): string {
  const get = (id: number) => businessTypes.find((bt) => bt.id === id);
  const r1 = get(result.rank1.typeId);
  const r2 = get(result.rank2.typeId);
  const r3 = get(result.rank3.typeId);

  const rankBlock = (
    label: string,
    bt: ReturnType<typeof get>,
    reason: string,
    featured: boolean
  ) => {
    if (!bt) return "";
    const bg = featured ? "#1e3a5f" : "#f9fafb";
    const color = featured ? "#ffffff" : "#1f2937";
    const sub = featured ? "#93c5fd" : "#6b7280";
    return `
    <div style="background:${bg};border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="background:${featured ? "#d4a017" : "#e5e7eb"};color:${featured ? "#1e3a5f" : "#374151"};font-size:12px;font-weight:bold;padding:3px 10px;border-radius:20px;">${label}</span>
        <span style="font-size:18px;font-weight:bold;color:${color};">${bt.name}</span>
      </div>
      <p style="font-size:13px;color:${sub};margin:0 0 8px;">${bt.description}</p>
      <p style="font-size:14px;color:${featured ? "#dbeafe" : "#374151"};line-height:1.7;margin:0 0 12px;">${reason}</p>
      <div style="background:${featured ? "rgba(255,255,255,0.1)" : "#f3f4f6"};border-radius:8px;padding:10px;font-size:12px;color:${sub};">
        即金性：${bt.immediacy}　参入条件：${bt.entryBar}　スケール性：${bt.scalability}
      </div>
      <div style="margin-top:10px;border-left:3px solid #d4a017;padding-left:10px;font-size:12px;color:${featured ? "#bfdbfe" : "#6b7280"};line-height:1.7;">
        「${bt.sekiComment}」
      </div>
    </div>`;
  };

  const adviceItems = result.advice
    .map(
      (adv, i) => `
    <div style="display:flex;gap:12px;margin-bottom:14px;">
      <span style="flex-shrink:0;width:24px;height:24px;background:#d4a017;color:#1e3a5f;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">${i + 1}</span>
      <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">${adv}</p>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:28px 24px;text-align:center;">
      <h1 style="color:#fff;font-size:20px;margin:0 0 6px;">ひとりビジネス適性診断</h1>
      <p style="color:#93c5fd;font-size:13px;margin:0;">関達也監修</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1e3a5f;margin:0 0 20px;">${lastName}さん、診断結果が届きました！</p>
      ${rankBlock("🏆 1位", r1, result.rank1.reason, true)}
      ${rankBlock("2位", r2, result.rank2.reason, false)}
      ${rankBlock("3位", r3, result.rank3.reason, false)}
      <div style="background:#1e3a5f;border-radius:12px;padding:24px;margin:20px 0;">
        <h2 style="color:#fff;font-size:16px;margin:0 0 16px;">関達也からの3つのアドバイス</h2>
        ${adviceItems}
      </div>
      <div style="text-align:center;background:#fffbeb;border:2px solid #d4a017;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="font-size:15px;font-weight:bold;color:#1e3a5f;margin:0 0 12px;">次のステップ：個別相談（無料）</p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">診断結果をもとに、あなたに最適なスタートプランを<br>関達也が直接アドバイスします。</p>
        <a href="#" style="display:inline-block;background:#d4a017;color:#fff;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;">個別相談はこちら →</a>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
        <p style="font-size:13px;font-weight:bold;color:#1e3a5f;margin:0 0 8px;">関達也 プロフィール</p>
        <p style="font-size:12px;color:#6b7280;line-height:1.8;margin:0;">1993年、26歳で独立。飲食・物販・サービス業・教育事業など11種のひとりビジネスを実践。ドロップシッピング初年4,645万円、教材販売8,400万円超、メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。「せき塾」「MIB」など3,000名以上のひとり起業家を直接サポート。</p>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">このメールは「ひとりビジネス適性診断」からお送りしています。</p>
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

    const { data, error } = await resend.emails.send({
      from: "ひとりビジネス適性診断 <onboarding@resend.dev>",
      to: [email],
      subject: "【診断結果】あなたに向いているひとりビジネスタイプが届きました",
      html: buildHtml(lastName, result),
    });

    if (error) {
      // ドメイン未検証などの制限はサーバーログに記録し、フロントには成功を返す
      // （リード取得が主目的のためメール送信失敗で全結果表示をブロックしない）
      console.warn("Resend warning (email not sent):", error);
      return Response.json({ success: true, emailSent: false, warning: error.message });
    }

    return Response.json({ success: true, emailSent: true, id: data?.id });
  } catch (err) {
    console.error("Send-email error:", err);
    return Response.json(
      { error: "メール送信中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
