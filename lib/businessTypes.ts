import { BusinessType } from "@/types";

export const businessTypes: BusinessType[] = [
  {
    id: 1,
    name: "物販タイプ",
    description: "転売・せどり・輸出入・ハンドメイド・ドロップシッピング",
    suitable: "モノを扱うのが好き、行動力がある人",
    sekiComment:
      "私は宮崎のどん底時代、雑貨店2店舗を経営し1店舗で年商6,500万円を達成。その後ドロップシッピングで初月206万円、初年で4,645万円を稼ぎました。モノを売る力は最強の基礎スキルです",
    immediacy: "高",
    entryBar: "資金少し必要",
    scalability: "中",
  },
  {
    id: 2,
    name: "スキル提供タイプ",
    description: "Webライター・動画編集・プログラミング・Webデザイン・Web制作",
    suitable: "特定のスキルがある、または習得意欲がある人",
    sekiComment:
      "スキルがあれば今すぐ稼げる。私もWebライター育成塾を主宰し、ゼロから稼げるライターを多数輩出しました",
    immediacy: "高",
    entryBar: "スキル必要",
    scalability: "低〜中",
  },
  {
    id: 3,
    name: "教育タイプ",
    description: "コンサル・コーチング・塾・スクール・オンライン講座",
    suitable: "人に教えること・サポートすることが好きな人",
    sekiComment:
      "私が最も長く取り組んできたタイプ。せき塾・MIBなど、3,000名以上を直接サポートしてきました。あなたの経験や知識は、誰かの人生を変える力があります",
    immediacy: "中",
    entryBar: "経験・信頼必要",
    scalability: "中〜高",
  },
  {
    id: 4,
    name: "コンテンツタイプ",
    description: "電子書籍・PDF教材・テンプレート・動画コース販売",
    suitable: "知識をまとめるのが得意、一度作って売り続けたい人",
    sekiComment:
      "私は1,000ページの教材を制作し、3,300冊・8,400万円以上を売り上げました。一度作れば寝ていても売れる仕組みです",
    immediacy: "低〜中",
    entryBar: "知識・制作力必要",
    scalability: "高",
  },
  {
    id: 5,
    name: "サービスタイプ",
    description: "ハウスクリーニング・リフォーム・占い・おっさんレンタル・スペース貸し",
    suitable: "手に職がある、地域密着で働きたい人",
    sekiComment:
      "私はどん底のとき、ハウスクリーニングで家族を養いました。技術があれば今日から稼げる。軽く見てはいけないタイプです",
    immediacy: "高",
    entryBar: "技術・資格あると有利",
    scalability: "低",
  },
  {
    id: 6,
    name: "マッチングタイプ",
    description: "人と人・売り手と買い手をつなぎ仲介手数料を得る",
    suitable: "人脈がある、つなぐことが得意な人",
    sekiComment:
      "私は不動産でこのビジネスを実践。つなぐ力があれば在庫もスキルも不要です",
    immediacy: "中",
    entryBar: "人脈・信頼必要",
    scalability: "中〜高",
  },
  {
    id: 7,
    name: "イベントタイプ",
    description: "セミナー・ワークショップ・ライブ配信・投げ銭・単発イベント",
    suitable: "人前で話すのが得意、発信力がある人",
    sekiComment:
      "私はセミナー講師として全国10都市を同時開催し、年収1,000万円以上を達成。人前で話すことが得意な人には最速の稼ぎ方です",
    immediacy: "高",
    entryBar: "発信力必要",
    scalability: "中",
  },
  {
    id: 8,
    name: "業務委託タイプ",
    description: "ウーバーイーツ・Amazon Flexなど（軍資金づくりのつなぎ手段）",
    suitable: "今すぐ現金が必要、本命ビジネスの資金を貯めたい人",
    sekiComment:
      "正直、これはひとり起業というより軍資金を作るつなぎ手段です。私自身、どん底のときに様々なアルバイトで生き延びました。まず生活を安定させてから本命のビジネスに集中する、という使い方をおすすめします",
    immediacy: "最高",
    entryBar: "なし",
    scalability: "なし",
  },
  {
    id: 9,
    name: "メディア・情報発信タイプ",
    description: "ブログ・メルマガ・SNS・YouTube・ポッドキャスト＋アフィリエイト・アドセンス",
    suitable: "継続して発信できる、資産を積み上げたい人",
    sekiComment:
      "私のブログは100万人中9位、メルマガは10万部を達成。アフィリエイトでは日本一の成績も残しました。続ければ続けるほど資産になるタイプです",
    immediacy: "低",
    entryBar: "継続力必要",
    scalability: "高",
  },
  {
    id: 10,
    name: "サブスクリプションタイプ",
    description: "オンラインサロン・会員制コミュニティ・月額サービス",
    suitable: "ファンがいる、コミュニティを作りたい人",
    sekiComment:
      "私はDMMオンラインサロン『関達也ライフチェンジラボ』を主宰。8日で50名が満員になりました。毎月安定した収入が入るストックビジネスの王道です",
    immediacy: "低〜中",
    entryBar: "ファン・信頼必要",
    scalability: "高",
  },
  {
    id: 11,
    name: "AIタイプ",
    description: "AI活用コンサル・プロンプト販売・デジタルプロダクト・ノーコードツール開発",
    suitable: "AIやデジタルツールに興味がある、新しいものが好きな人",
    sekiComment:
      "2023年にChatGPTの登場で衝撃を受け、専門ブログを立ち上げてSEOのみで月6.5万PVを達成。AIを使いこなせる人が、これからの時代に最も自由になれると確信しています",
    immediacy: "中",
    entryBar: "AI・デジタルへの興味必要",
    scalability: "高",
  },
];
