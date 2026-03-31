import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary } from "@zxcvbn-ts/language-common";
import { dictionary as englishDictionary, translations as englishTranslations } from "@zxcvbn-ts/language-en";

import type { PasswordAnalysis } from "@/lib/types";

zxcvbnOptions.setOptions({
  translations: englishTranslations,
  dictionary: {
    ...dictionary,
    ...englishDictionary,
  },
  graphs: adjacencyGraphs,
});

const scoreLabels = [
  {
    label: "Needs work",
    detail: "Too guessable for real accounts. Increase the length or switch templates.",
  },
  {
    label: "Weak",
    detail: "Okay for throwaway use, but not a good fit for any account you care about.",
  },
  {
    label: "Fair",
    detail: "Decent start. Use more length for work, banking, or anything important.",
  },
  {
    label: "Good for most accounts",
    detail: "Strong enough for typical logins when you store it in a password manager.",
  },
  {
    label: "Excellent",
    detail: "Long and resilient. A strong choice for high-value or long-term credentials.",
  },
] as const;

export function analyzePassword(password: string): PasswordAnalysis {
  const result = zxcvbn(password);
  const mapped = scoreLabels[result.score];

  return {
    score: result.score,
    label: mapped.label,
    detail: mapped.detail,
    warning: result.feedback.warning || undefined,
    suggestions: result.feedback.suggestions,
    crackTimeDisplay: result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
  };
}
