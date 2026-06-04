"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/lib/questions";
import { Answers } from "@/types";

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const q = questions[currentIndex];
  const total = questions.length;
  const progressPct = Math.round((currentIndex / total) * 100);

  // When navigating, restore state for the current question
  useEffect(() => {
    if (q.type !== "single") {
      setPendingChoice(answers[`q${q.id}_choice`] ?? null);
      setTextInput(answers[`q${q.id}_text`] ?? "");
    } else {
      setPendingChoice(null);
      setTextInput("");
    }
    // Scroll card into view on mobile
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = async (nextAnswers: Answers) => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      await submitDiagnosis(nextAnswers);
    }
  };

  const handleOptionClick = async (option: string) => {
    if (q.type === "single") {
      const next = { ...answers, [`q${q.id}`]: option };
      setAnswers(next);
      await advance(next);
      return;
    }

    if (q.type === "single_with_conditional_text") {
      const isLast = q.options.indexOf(option) === q.options.length - 1;
      if (isLast) {
        const next = { ...answers, [`q${q.id}_choice`]: option };
        setAnswers(next);
        setPendingChoice(null);
        await advance(next);
        return;
      }
    }

    // single_with_text or conditional text (non-last option)
    setPendingChoice(option);
    setAnswers((prev) => ({ ...prev, [`q${q.id}_choice`]: option }));
  };

  const handleNext = async () => {
    const choice = pendingChoice ?? answers[`q${q.id}_choice`];
    if (!choice) return;
    const next: Answers = {
      ...answers,
      [`q${q.id}_choice`]: choice,
      ...(textInput.trim() ? { [`q${q.id}_text`]: textInput.trim() } : {}),
    };
    setAnswers(next);
    setPendingChoice(null);
    setTextInput("");
    await advance(next);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const submitDiagnosis = async (finalAnswers: Answers) => {
    setIsLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      if (!res.ok) throw new Error("API error");
      const result = await res.json();
      localStorage.setItem("diagnosisResult", JSON.stringify(result));
      localStorage.setItem("diagnosisAnswers", JSON.stringify(finalAnswers));
      router.push("/result");
    } catch {
      setApiError("診断中にエラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  const showTextInput =
    (q.type === "single_with_text" && pendingChoice !== null) ||
    (q.type === "single_with_conditional_text" &&
      pendingChoice !== null &&
      q.options.indexOf(pendingChoice) < q.options.length - 1);

  const showNextButton =
    (q.type === "single_with_text" && pendingChoice !== null) ||
    (q.type === "single_with_conditional_text" &&
      pendingChoice !== null &&
      q.options.indexOf(pendingChoice) < q.options.length - 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-xl font-bold mb-2">診断中...</p>
          <p className="text-blue-200 text-sm">
            あなたの回答をAIが分析しています
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar – sticky */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {q.block}
            </span>
            <span className="text-xs text-[#1e3a5f] font-bold">
              Q{currentIndex + 1} / {total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="mx-auto max-w-2xl px-4 py-8" ref={cardRef}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Block label */}
          <div className="inline-block bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold px-3 py-1 rounded-full mb-4">
            {q.block}
          </div>

          {/* Question */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
            {q.question}
          </h2>
          {q.note && (
            <p className="text-sm text-gray-500 mb-5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              💡 {q.note}
            </p>
          )}
          {!q.note && <div className="mb-5" />}

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((option) => {
              const isSelected =
                answers[`q${q.id}`] === option ||
                answers[`q${q.id}_choice`] === option ||
                pendingChoice === option;

              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-150 ${
                    isSelected
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Text input */}
          {showTextInput && (
            <div className="mt-5">
              <label className="block text-sm text-gray-600 mb-2 font-medium">
                詳細（任意）
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={q.textPlaceholder}
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-none"
              />
            </div>
          )}

          {/* Error */}
          {apiError && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {apiError}
            </p>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center gap-3">
            {currentIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                ← 戻る
              </button>
            )}
            {showNextButton && (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white py-3 rounded-xl font-bold text-sm transition-colors"
              >
                次へ →
              </button>
            )}
          </div>
        </div>

        {/* Tip at bottom */}
        <p className="text-center text-gray-400 text-xs mt-4">
          選択肢を選ぶと自動で次の質問に進みます
        </p>
      </div>
    </div>
  );
}
