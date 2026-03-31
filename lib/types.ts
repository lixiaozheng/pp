export type PasswordMode = "random" | "memorable" | "pin";

export type GeneratorConfig = {
  mode: PasswordMode;
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  wordCount: number;
  separator: string;
};

export type PasswordStrength = {
  score: number;
  label: string;
  detail: string;
  warning?: string;
  suggestions: string[];
};

export type PasswordAnalysis = PasswordStrength & {
  crackTimeDisplay: string;
};

export type PasswordResult = {
  value: string;
  analysis: PasswordAnalysis;
  composition: string[];
};

export type TemplateDefinition = {
  id: string;
  name: string;
  mode: PasswordMode;
  description: string;
  reason: string;
  recommendedFor: string;
  config: GeneratorConfig;
};
