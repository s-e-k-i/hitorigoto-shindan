"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { businessTypes } from "@/lib/businessTypes";
import { DiagnosisResult, BusinessType } from "@/types";

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
};

function TypeCard({
  rankLabel,
  bt,
  reason,
  featured,
}: {
  rankLabel: string;
  bt: BusinessType;
  reason: string;
  featured?: boolean;
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

      <p className={`text-sm leading-relaxed mb-4 ${featured ? "text-blue-50" : "text-gray-700"}`}>
        {reason}
      </p>

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
        「{bt.sekiComment}」
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("peek");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName: lastName.trim(), email: email.trim(), result }),
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
              featured
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
              無料で全結果を受け取る →
            </button>
          </div>
        )}

        {/* 2位・3位（peekではぼかし、fullでは通常表示） */}
        {phase !== "email" && (
          <div className={`space-y-4 ${phase === "peek" ? "opacity-40 blur-sm pointer-events-none select-none" : ""}`}>
            {rank2Type && (
              <TypeCard rankLabel="2位" bt={rank2Type} reason={result.rank2.reason} />
            )}
            {rank3Type && (
              <TypeCard rankLabel="3位" bt={rank3Type} reason={result.rank3.reason} />
            )}
          </div>
        )}

        {/* ===== email フェーズ：入力フォーム ===== */}
        {phase === "email" && (
          <div className="bg-white rounded-2xl border-2 border-[#d4a017] shadow-md p-6 sm:p-8">
            <h2 className="text-[#1e3a5f] text-lg font-bold mb-1">
              無料で全結果を受け取る
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              2位・3位の詳細と関達也からの3つのアドバイスをお届けします
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前（姓）<span className="text-red-500 ml-1">※必須</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="例：関"
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
                {isSubmitting ? "送信中..." : "無料で全結果を受け取る"}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                ご登録いただくと、関達也の無料メールマガジンも同時にお届けします。
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
              <div className="space-y-4">
                {result.advice.map((adv, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#d4a017] rounded-full flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed pt-1">{adv}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-[#d4a017] rounded-2xl p-6 text-center">
              <h3 className="text-[#1e3a5f] font-bold text-lg mb-2">
                次のステップ：個別相談
              </h3>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                診断結果をもとに、あなたに最適なスタートプランを
                <br />
                関達也が直接アドバイスします。
              </p>
              <a
                href="https://sekitatsuya.com/spot-consulting/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#d4a017] hover:bg-[#c49010] text-white font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-md"
              >
                個別相談はこちら →
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#1e3a5f] font-bold text-base mb-3">監修者：関達也（ひとり起業コンサル）</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                1994年、24歳で独立。物販・サービス業・教育事業など11種のビジネスを実践。ドロップシッピングでは初年4,645万円、教材販売では8,400万円超を達成。メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。3,000名以上のひとり起業家を直接サポートしてきた関達也が設計した診断です。
              </p>
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
