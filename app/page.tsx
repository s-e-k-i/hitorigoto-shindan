import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#2d5a8e]">
      <div className="mx-auto max-w-2xl px-4 py-16 flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6">
          <span className="bg-[#d4a017] text-[#1e3a5f] text-sm font-bold px-4 py-1.5 rounded-full">
            無料診断 · 約3分で完了
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center text-white font-bold leading-tight mb-3">
          <span className="block text-4xl sm:text-5xl">ひとりビジネス</span>
          <span className="block text-4xl sm:text-5xl">適性診断</span>
        </h1>

        {/* Sub copy */}
        <p className="text-center text-blue-200 text-sm mb-4">
          副業・起業・独立、あなたに合うひとりビジネスの形が見つかります
        </p>

        {/* Subtitle */}
        <p className="text-center text-blue-200 text-sm sm:text-base mb-10 leading-relaxed">
          <span className="text-white font-bold">ひとり起業コンサル・関達也</span>が監修
          <br />
          独立31年・11種のビジネスを実践し
          <br />
          3,000名以上を直接サポート
        </p>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-10 mb-8">
          <h2 className="text-[#1e3a5f] text-xl font-bold mb-2 text-center">
            あなたに向いているひとりビジネスはどれ？
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            15問に答えるだけでAIが診断します
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-[#d4a017] text-xl font-bold mt-0.5">✓</span>
              <div>
                <p className="text-gray-800 font-semibold">選択肢を選ぶだけ・約3分</p>
                <p className="text-gray-500 text-sm">難しい記入は不要です</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d4a017] text-xl font-bold mt-0.5">✓</span>
              <div>
                <p className="text-gray-800 font-semibold">11種のビジネスタイプから最適解を提案</p>
                <p className="text-gray-500 text-sm">あなたの状況・スキル・目標に合わせて分析</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d4a017] text-xl font-bold mt-0.5">✓</span>
              <div>
                <p className="text-gray-800 font-semibold">関達也からの個別アドバイス3つ付き</p>
                <p className="text-gray-500 text-sm">あなたの回答をAIが分析し、今すぐできる行動を提案</p>
              </div>
            </li>
          </ul>

          <Link
            href="/diagnosis"
            className="block w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white text-center text-lg font-bold py-4 rounded-xl transition-colors duration-200 shadow-md"
          >
            診断を始める（無料・3分）
          </Link>
        </div>

        {/* Profile */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <h3 className="font-bold text-base mb-3">監修者：関達也（ひとり起業コンサル）</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            24歳で独立して31年。物販・サービス業・教育事業など11種のビジネスを実践。PC1台のひとりビジネスで1億円を達成。メルマガ10万部・ブログ100万人中9位・アフィリエイト日本一など多数の実績を持つ。3,000名以上を直接サポートしてきた関達也が設計した診断です。
          </p>
        </div>
      </div>
    </main>
  );
}
