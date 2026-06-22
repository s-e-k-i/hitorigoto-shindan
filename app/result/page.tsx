"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { businessTypes } from "@/lib/businessTypes";
import { DiagnosisResult, BusinessType } from "@/types";
import { FaThreads } from "react-icons/fa6";

type Phase = "peek" | "email" | "full";

function ScoreDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < value ? "bg-[#d4a017]" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const immediacyScore: Record<string, number> = {
  最高: 5,
  高: 4,
  中: 3,
  "低〜中": 2,
  低: 1,
  なし: 0,
};
const scalabilityScore: Record<string, number> = {
  高: 5,
  "中〜高": 4,
  中: 3,
  "低〜中": 2,
  低: 1,
  なし: 0,
  "次第で変わる": 2,
};

function TypeCard({
  rankLabel,
  bt,
  reason,
  sekiComment,
  featured,
  detailLevel,
}: {
  rankLabel: string;
  bt: BusinessType;
  reason: string;
  sekiComment?: string;
  featured?: boolean;
  detailLevel?: "partial" | "full";
}) {
  return (
    <div
      className={`rounded-2xl border-2 ${
        featured
          ? "border-[#1e3a5f] bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg"
          : "border-gray-200 bg-white text-gray-800"
      } p-6`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            featured ? "bg-[#d4a017] text-[#1e3a5f]" : "bg-gray-100 text-gray-600"
          }`}
        >
          {rankLabel}
        </span>
        <span className={`text-xl font-bold ${featured ? "text-white" : "text-[#1e3a5f]"}`}>
          {bt.name}
        </span>
      </div>

      <p className={`text-sm mb-3 ${featured ? "text-blue-100" : "text-gray-500"}`}>
        {bt.description}
      </p>

      {detailLevel !== "full" && (
        <p className={`text-sm leading-relaxed mb-4 ${featured ? "text-blue-50" : "text-gray-700"}`}>
          {reason}
        </p>
      )}

      {/* 特徴・向いている理由（partial / full で表示） */}
      {(detailLevel === "partial" || detailLevel === "full") && (
        <div className={`rounded-xl p-4 mb-4 space-y-3 text-sm ${featured ? "bg-white/10" : "bg-blue-50"}`}>
          <div>
            <p className={`text-xs font-bold mb-1 ${featured ? "text-[#d4a017]" : "text-[#1e3a5f]"}`}>特徴</p>
            <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{bt.feature}</p>
          </div>
          <div>
            <p className={`text-xs font-bold mb-1 ${featured ? "text-[#d4a017]" : "text-[#1e3a5f]"}`}>向いている理由</p>
            <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{bt.suitableReason}</p>
          </div>
        </div>
      )}

      <div className={`rounded-xl p-4 space-y-2 text-xs ${featured ? "bg-white/10" : "bg-gray-50"}`}>
        <div className="flex items-center justify-between">
          <span className={featured ? "text-blue-200" : "text-gray-500"}>即金性</span>
          <div className="flex items-center gap-2">
            <ScoreDots value={immediacyScore[bt.immediacy] ?? 3} />
            <span className={`font-medium ${featured ? "text-white" : "text-gray-700"}`}>
              {bt.immediacy}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={featured ? "text-blue-200" : "text-gray-500"}>参入条件</span>
          <span className={`font-medium text-right ${featured ? "text-white" : "text-gray-700"}`}>
            {bt.entryBar}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={featured ? "text-blue-200" : "text-gray-500"}>スケール性</span>
          <div className="flex items-center gap-2">
            <ScoreDots value={scalabilityScore[bt.scalability] ?? 3} />
            <span className={`font-medium ${featured ? "text-white" : "text-gray-700"}`}>
              {bt.scalability}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl p-4 text-xs leading-relaxed border-l-4 border-[#d4a017] ${
          featured ? "bg-white/10 text-blue-100" : "bg-amber-50 text-gray-700"
        }`}
      >
        <p className="font-bold text-xs mb-1 text-[#d4a017]">関達也のコメント</p>
        {sekiComment ?? bt.sekiComment}
      </div>

      {/* おすすめのビジネス例・最初にやること・つまずきやすい点・アドバイス（full のみ） */}
      {detailLevel === "full" && (
        <div className="mt-4 space-y-4">
          <div className={`rounded-xl p-4 text-sm ${featured ? "bg-white/10" : "bg-gray-50"}`}>
            <p className={`text-xs font-bold mb-2 ${featured ? "text-[#d4a017]" : "text-[#1e3a5f]"}`}>おすすめのビジネス例</p>
            <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{bt.businessExamples}</p>
          </div>

          <div className={`rounded-xl p-4 text-sm ${featured ? "bg-white/10" : "bg-green-50"}`}>
            <p className={`text-xs font-bold mb-2 ${featured ? "text-[#d4a017]" : "text-green-700"}`}>最初にやること</p>
            <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{bt.firstStep}</p>
          </div>

          <div className={`rounded-xl p-4 text-sm ${featured ? "bg-white/10" : "bg-orange-50"}`}>
            <p className={`text-xs font-bold mb-2 ${featured ? "text-[#d4a017]" : "text-orange-700"}`}>つまずきやすい点</p>
            <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{bt.pitfall}</p>
          </div>

          <div className={`rounded-xl p-4 text-sm ${featured ? "bg-white/10" : "bg-purple-50"}`}>
            <p className={`text-xs font-bold mb-3 ${featured ? "text-[#d4a017]" : "text-purple-700"}`}>アドバイス</p>
            <div className="space-y-2">
              {bt.adviceList.map((adv, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${featured ? "bg-[#d4a017] text-[#1e3a5f]" : "bg-purple-200 text-purple-800"}`}>
                    {i + 1}
                  </span>
                  <p className={`leading-relaxed ${featured ? "text-blue-100" : "text-gray-700"}`}>{adv}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const showConsulting = process.env.NEXT_PUBLIC_SHOW_CONSULTING !== "false";

export default function ResultPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("peek");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [comment, setComment] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("diagnosisResult");
    if (!stored) {
      router.replace("/diagnosis");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.replace("/diagnosis");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1e3a5f]/30 border-t-[#1e3a5f] rounded-full animate-spin" />
      </div>
    );
  }

  const rank1Type = businessTypes.find((bt) => bt.id === result.rank1.typeId);
  const rank2Type = businessTypes.find((bt) => bt.id === result.rank2.typeId);
  const rank3Type = businessTypes.find((bt) => bt.id === result.rank3.typeId);

  // ── シェア用テキスト・URL生成 ──────────────────────────────
  const SITE_URL = "https://hitoribusiness-shindan.vercel.app";

  const buildHashtags = (): string => {
    const tags: string[] = ["#ひとりビジネス適性診断"];

    // Q4/Q5 の回答からハッシュタグを判定
    const answers: Record<string, string> = (() => {
      try { return JSON.parse(localStorage.getItem("diagnosisAnswers") ?? "{}"); }
      catch { return {}; }
    })();
    const q4 = (answers["q4"] ?? "").toLowerCase();
    const q5 = (answers["q5"] ?? "").toLowerCase();
    const combined = q4 + q5;
    if (combined.includes("副収入") || combined.includes("お小遣い") || combined.includes("3万")) {
      tags.push("#副業");
    } else if (combined.includes("フリーランス") || combined.includes("在宅")) {
      tags.push("#フリーランス");
    } else if (combined.includes("独立") || combined.includes("起業") || combined.includes("50万")) {
      tags.push("#ひとり起業");
    } else {
      tags.push("#ひとりビジネス");
    }

    // 1位タイプからハッシュタグ
    const typeTagMap: Record<string, string> = {
      "スキル提供タイプ": "#スキルで稼ぐ",
      "教育・相談タイプ": "#コンサル",
      "コンテンツ販売タイプ": "#コンテンツ販売",
      "メディア・情報発信タイプ": "#情報発信",
      "AI活用タイプ": "#AI副業",
      "物販タイプ": "#物販",
      "生活サポート・代行タイプ": "#サービス業",
      "マッチングタイプ": "#マッチングビジネス",
      "イベントタイプ": "#セミナー",
      "サブスクリプションタイプ": "#オンラインサロン",
      "即金フリータイプ": "#副業",
    };
    const typeTag = rank1Type ? typeTagMap[rank1Type.name] : undefined;
    // 重複チェック（例：目的タグ #副業 とタイプタグ #副業 が同じ場合）
    if (typeTag && !tags.includes(typeTag)) tags.push(typeTag);

    return tags.slice(0, 3).join(" ");
  };

  const buildShareText = (): string => {
    const typeName = rank1Type?.name ?? "診断完了";
    const desc = rank1Type?.description ?? "";
    const hashtags = buildHashtags();
    return `診断結果：${typeName}でした✨\n\n${desc}\n\n▼ あなたのひとりビジネスタイプは？（無料・15問）\n${SITE_URL}\n\n${hashtags}`;
  };

  const buildLineText = (): string => {
    const typeName = rank1Type?.name ?? "診断完了";
    return `ひとりビジネス適性診断を受けました！\n私の結果は「${typeName}」でした😊\n\n15問で自分に合うビジネスタイプがわかります。\nよかったら受けてみて↓\n${SITE_URL}`;
  };

  // Threadsのintent URLは絵文字を◆に文字化けさせる既知の問題があるため
  // Threads専用テキストでは絵文字を除去する
  const buildThreadsShareText = (): string => {
    const typeName = rank1Type?.name ?? "診断完了";
    const desc = rank1Type?.description ?? "";
    const hashtags = buildHashtags();
    return `診断結果：${typeName}でした！\n\n${desc}\n\n▼ あなたのひとりビジネスタイプは？（無料・15問）\n${SITE_URL}\n\n${hashtags}`;
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(buildLineText())}`;
  const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(buildThreadsShareText())}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  // ─────────────────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: lastName.trim(),
          email: email.trim(),
          result,
          answers: JSON.parse(localStorage.getItem("diagnosisAnswers") ?? "{}"),
        }),
      });
      // メール送信の成否に関わらず全結果を表示する（リード取得が目的）
      setPhase("full");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // ネットワークエラーのみ表示。その他は結果を表示して続行。
      setSubmitError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] py-6 px-4 text-center">
        <p className="text-blue-200 text-sm mb-1">診断完了！</p>
        <h1 className="text-white text-2xl font-bold">ひとりビジネス適性診断</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* 1位カード（常時表示） */}
        {rank1Type && (
          <div>
            {phase !== "full" && (
              <p className="text-center text-gray-600 text-sm mb-4">
                あなたに最も向いているビジネスタイプは...
              </p>
            )}
            <TypeCard
              rankLabel="🏆 1位"
              bt={rank1Type}
              reason={result.rank1.reason}
              sekiComment={result.rank1.sekiComment}
              featured
              detailLevel={phase === "full" ? "full" : "partial"}
            />
          </div>
        )}

        {/* ===== peek フェーズ：CTAボックス（1位直下・スクロール不要） ===== */}
        {phase === "peek" && (
          <div className="bg-white rounded-2xl border-2 border-[#d4a017] shadow-md p-6 text-center">
            <p className="text-[#1e3a5f] font-bold text-base mb-1 leading-snug">
              詳しい分析と関達也からの
              <br />
              3つのアドバイスを無料で受け取りますか？
            </p>
            <p className="text-gray-500 text-xs mb-5">2位・3位のタイプも表示されます</p>
            <button
              onClick={() => setPhase("email")}
              className="w-full bg-[#d4a017] hover:bg-[#c49010] text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              無料で詳しい診断結果を受け取る →
            </button>
          </div>
        )}

        {/* 2位・3位（peekではぼかし、fullでは通常表示） */}
        {phase !== "email" && (
          <div className={`space-y-4 ${phase === "peek" ? "opacity-40 blur-sm pointer-events-none select-none" : ""}`}>
            {rank2Type && (
              <TypeCard rankLabel="2位" bt={rank2Type} reason={result.rank2.reason} sekiComment={result.rank2.sekiComment} detailLevel={phase === "full" ? "full" : undefined} />
            )}
            {rank3Type && (
              <TypeCard rankLabel="3位" bt={rank3Type} reason={result.rank3.reason} sekiComment={result.rank3.sekiComment} detailLevel={phase === "full" ? "full" : undefined} />
            )}
          </div>
        )}

        {/* ===== email フェーズ：入力フォーム ===== */}
        {phase === "email" && (
          <div className="bg-white rounded-2xl border-2 border-[#d4a017] shadow-md p-6 sm:p-8">
            <h2 className="text-[#1e3a5f] text-lg font-bold mb-1">
              無料で詳しい診断結果を受け取る
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              2位・3位の詳細と関達也からの3つのアドバイスをお届けします
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前（姓またはニックネーム）<span className="text-red-500 ml-1">※必須</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="例：山田 / たろう"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス<span className="text-red-500 ml-1">※必須</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例：example@email.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !lastName.trim() || !email.trim()}
                className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-base"
              >
                {isSubmitting ? "送信中..." : "無料で詳しい診断結果を受け取る"}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                ご登録いただいた方には、関達也の無料メールマガジンもお届けします。
              </p>
            </form>
          </div>
        )}

        {/* ===== full フェーズ：アドバイス・CTA・プロフィール ===== */}
        {phase === "full" && (
          <>
            <div className="bg-[#1e3a5f] rounded-2xl p-6 sm:p-8">
              <h2 className="text-white text-lg font-bold mb-5">
                関達也からの3つのアドバイス
              </h2>
              <div>
                {result.advice.map((adv, i) => {
                  const text = adv.replace(/^[①②③1-9０-９][.．。）\)]\s*/, "").trim();
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                      <div style={{
                        minWidth: "28px",
                        height: "28px",
                        background: "#d4a017",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "bold",
                        flexShrink: 0,
                        marginTop: "3px",
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: "14px", color: "rgba(219,234,254,1)", lineHeight: 1.7 }}>{text}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {showConsulting && (
              <div className="border-y border-gray-200 py-6">
                <p className="text-gray-700 text-sm font-medium mb-1 leading-relaxed">
                  診断結果を読んで、「自分の場合は具体的にどう動けばいいんだろう」と感じた方へ。
                </p>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  あなたの状況に合わせて、一緒に整理します。
                </p>
                <a
                  href="https://sekitatsuya.com/lp/hitoribiz-shindan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                >
                  個別相談の詳細を見る
                </a>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#1e3a5f] font-bold text-base mb-3">監修者：関達也（ひとり起業コンサル）</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                24歳で独立して31年。物販・サービス業・教育事業など11種のビジネスを実践。PC1台のひとりビジネスで1億円を達成。メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。3,000名以上を直接サポートしてきた関達也が設計した診断です。
              </p>
            </div>

            {/* シェアセクション */}
            <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)" }}>
              <h3 className="text-[#1e3a5f] font-bold text-base mb-1">📣 診断結果をシェアする</h3>
              <p className="text-gray-500 text-xs mb-5">もし誰かの参考になりそうなら、シェアしてもらえると嬉しいです。</p>
              <div className="grid grid-cols-2 gap-3">
                {/* X */}
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: "48px" }}
                  className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors px-4 py-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X でシェア
                </a>
                {/* LINE */}
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: "#06C755", minHeight: "48px" }}
                  className="flex items-center justify-center gap-2 text-white text-sm font-bold rounded-xl transition-colors px-4 py-3"
                >
                  <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                  LINEでシェア
                </a>
                {/* Threads */}
                <a
                  href={threadsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: "48px" }}
                  className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors px-4 py-3"
                >
                  <FaThreads size={20} color="white" />
                  Threadsでシェア
                </a>
                {/* URLコピー */}
                <button
                  onClick={handleCopyUrl}
                  style={{ minHeight: "48px" }}
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-colors px-4 py-3"
                >
                  {urlCopied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      コピーしました✓
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      URLをコピー
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* コメント送信フォーム */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#1e3a5f] font-bold text-base mb-1">
                診断を受けてみての感想・気になった点をお聞かせください
              </h3>
              <p className="text-gray-400 text-xs mb-4">良かった点や、分かりにくかった点があれば教えてください（匿名・任意）</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={commentSubmitted}
                rows={4}
                placeholder="良かったこと、気になったこと、分かりにくかった点など"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-none disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={async () => {
                  if (!comment.trim() || isSubmittingComment || commentSubmitted) return;
                  setIsSubmittingComment(true);
                  try {
                    await fetch("/api/send-comment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email,
                        name: lastName,
                        rank1TypeName: rank1Type?.name ?? "不明",
                        comment: comment.trim(),
                      }),
                    });
                    setCommentSubmitted(true);
                  } finally {
                    setIsSubmittingComment(false);
                  }
                }}
                disabled={!comment.trim() || isSubmittingComment || commentSubmitted}
                className="mt-3 w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                {commentSubmitted ? "送信しました ✓" : isSubmittingComment ? "送信中..." : "感想を送る"}
              </button>
              {commentSubmitted && (
                <p className="mt-3 text-sm text-green-600 font-medium text-center">
                  ご意見を送信しました。ありがとうございます！
                </p>
              )}
            </div>

            <div className="text-center pb-4">
              <button
                onClick={() => {
                  localStorage.removeItem("diagnosisResult");
                  localStorage.removeItem("diagnosisAnswers");
                  router.push("/diagnosis");
                }}
                className="text-gray-400 text-sm underline hover:text-gray-600"
              >
                もう一度診断する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
