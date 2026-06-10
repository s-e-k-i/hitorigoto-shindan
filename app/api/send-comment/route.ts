import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tatsu7676@gmail.com";

export async function POST(request: Request) {
  try {
    const { email, name, rank1TypeName, comment } = (await request.json()) as {
      email: string;
      name: string;
      rank1TypeName: string;
      comment: string;
    };

    if (!comment?.trim()) {
      return Response.json({ error: "コメントが空です" }, { status: 400 });
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Hiragino Sans',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#1e3a5f;padding:20px 24px;">
      <h1 style="color:#ffffff;font-size:18px;margin:0;font-weight:bold;">💬 感想が届きました</h1>
      <p style="color:#93c5fd;font-size:12px;margin:4px 0 0;">ひとりビジネス適性診断</p>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 4px;color:#555555;width:35%;">メールアドレス</td>
          <td style="padding:10px 4px;font-weight:bold;color:#333333;">
            <a href="mailto:${email}" style="color:#1e3a5f;">${email}</a>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 4px;color:#555555;">お名前</td>
          <td style="padding:10px 4px;font-weight:bold;color:#333333;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 4px;color:#555555;">診断結果1位</td>
          <td style="padding:10px 4px;font-weight:bold;color:#333333;">${rank1TypeName}</td>
        </tr>
      </table>
      <div style="background:#f9fafb;border-left:4px solid #1e3a5f;border-radius:4px;padding:16px;">
        <p style="font-size:13px;font-weight:bold;color:#1e3a5f;margin:0 0 8px;">感想：</p>
        <p style="font-size:14px;color:#333333;line-height:1.75;margin:0;white-space:pre-wrap;">${comment.trim()}</p>
      </div>
    </div>
    <div style="background:#f9fafb;padding:14px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">ひとりビジネス適性診断 管理通知</p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: "ひとりビジネス適性診断（関達也） <info@sekitatsuya.com>",
      to: [ADMIN_EMAIL],
      subject: `【感想が届きました】${name}さんからひとりビジネス適性診断への感想`,
      html,
    });

    if (error) {
      console.error("[send-comment] Resend error:", error);
    }

    // 送信失敗でもフロントには成功を返す
    return Response.json({ success: true });
  } catch (err) {
    console.error("[send-comment] Unexpected error:", err);
    return Response.json({ error: "送信中にエラーが発生しました" }, { status: 500 });
  }
}
