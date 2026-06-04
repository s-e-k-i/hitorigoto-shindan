export interface BusinessType {
  id: number;
  name: string;
  description: string;
  suitable: string;
  sekiComment: string;
  immediacy: string;
  entryBar: string;
  scalability: string;
}

export interface Question {
  id: number;
  block: string;
  question: string;
  type: "single" | "single_with_text" | "single_with_conditional_text";
  options: string[];
  note?: string;
  textPlaceholder?: string;
}

export type Answers = Record<string, string>;

export interface RankResult {
  typeId: number;
  reason: string;
  sekiComment?: string;
}

export interface DiagnosisResult {
  rank1: RankResult;
  rank2: RankResult;
  rank3: RankResult;
  advice: string[];
}
