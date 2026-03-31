import { analyzePassword } from "@/lib/password-strength";
import type { GeneratorConfig, PasswordMode, PasswordResult } from "@/lib/types";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const NUMBERS_ALL = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";
const AMBIGUOUS = "O0Il1|`'\"";
const WORD_BANK = [
  "anchor",
  "apricot",
  "atlas",
  "birch",
  "canyon",
  "cedar",
  "comet",
  "coral",
  "ember",
  "fable",
  "fjord",
  "glimmer",
  "harbor",
  "ivory",
  "juniper",
  "lagoon",
  "lantern",
  "meadow",
  "nectar",
  "onyx",
  "orchard",
  "pebble",
  "quartz",
  "ripple",
  "saffron",
  "solstice",
  "summit",
  "thicket",
  "timber",
  "verge",
  "willow",
  "zephyr",
];

const MIN_LENGTH_BY_MODE: Record<PasswordMode, number> = {
  random: 8,
  memorable: 3,
  pin: 4,
};

const MAX_LENGTH_BY_MODE: Record<PasswordMode, number> = {
  random: 64,
  memorable: 6,
  pin: 12,
};

function getCrypto() {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure random generation is unavailable in this environment.");
  }

  return cryptoApi;
}

function randomIndex(max: number): number {
  if (max <= 0) {
    throw new Error("max must be greater than zero");
  }

  const cryptoApi = getCrypto();
  const limit = Math.floor(256 / max) * max;
  const bucket = new Uint8Array(1);

  while (true) {
    cryptoApi.getRandomValues(bucket);
    const value = bucket[0];

    if (value < limit) {
      return value % max;
    }
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function pick(characterSet: string) {
  return characterSet[randomIndex(characterSet.length)];
}

function sanitizeCharacterSet(input: string, excludeAmbiguous: boolean) {
  if (!excludeAmbiguous) {
    return input;
  }

  return [...input].filter((character) => !AMBIGUOUS.includes(character)).join("");
}

export function normalizeConfig(config: GeneratorConfig): GeneratorConfig {
  if (config.mode === "memorable") {
    return {
      ...config,
      wordCount: Math.max(MIN_LENGTH_BY_MODE.memorable, Math.min(config.wordCount, MAX_LENGTH_BY_MODE.memorable)),
    };
  }

  return {
    ...config,
    length: Math.max(MIN_LENGTH_BY_MODE[config.mode], Math.min(config.length, MAX_LENGTH_BY_MODE[config.mode])),
  };
}

function generateRandomPassword(config: GeneratorConfig): string {
  const pools = [
    config.includeUppercase ? sanitizeCharacterSet(UPPERCASE, config.excludeAmbiguous) : "",
    config.includeLowercase ? sanitizeCharacterSet(LOWERCASE, config.excludeAmbiguous) : "",
    config.includeNumbers ? sanitizeCharacterSet(NUMBERS_ALL, config.excludeAmbiguous) : "",
    config.includeSymbols ? sanitizeCharacterSet(SYMBOLS, config.excludeAmbiguous) : "",
  ].filter(Boolean);

  if (pools.length === 0) {
    throw new Error("Choose at least one character type.");
  }

  if (config.length < pools.length) {
    throw new Error("Length is too short for the selected character rules.");
  }

  const characters = pools.join("");
  const required = pools.map((pool) => pick(pool));
  const remainder = Array.from({ length: config.length - required.length }, () => pick(characters));

  return shuffle([...required, ...remainder]).join("");
}

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateMemorablePassword(config: GeneratorConfig): string {
  const separator = config.separator || "-";

  const words = Array.from({ length: config.wordCount }, () => {
    const base = WORD_BANK[randomIndex(WORD_BANK.length)];

    if (config.includeUppercase && config.includeLowercase) {
      return randomIndex(2) === 0 ? titleCase(base) : base;
    }

    if (config.includeUppercase) {
      return titleCase(base);
    }

    return base;
  });

  const needsNumber = config.includeNumbers;
  const numberSuffix = needsNumber ? pick(config.excludeAmbiguous ? NUMBERS : NUMBERS_ALL) : "";
  const symbolSuffix = config.includeSymbols ? pick(SYMBOLS) : "";

  return `${words.join(separator)}${numberSuffix}${symbolSuffix}`;
}

function generatePin(config: GeneratorConfig): string {
  return Array.from({ length: config.length }, () => pick(config.excludeAmbiguous ? NUMBERS : NUMBERS_ALL)).join("");
}

function describeComposition(config: GeneratorConfig, value: string): string[] {
  if (config.mode === "pin") {
    return [`${value.length} digits`, "Easy to type on keypads", "Best when the site only accepts a numeric PIN"];
  }

  if (config.mode === "memorable") {
    return [
      `${config.wordCount} words`,
      config.includeNumbers ? "Includes a number suffix" : "No forced number suffix",
      config.includeSymbols ? "Includes a symbol" : "Readable word separator",
    ];
  }

  const parts = [`${value.length} characters`];

  if (config.includeUppercase) parts.push("Uppercase");
  if (config.includeLowercase) parts.push("Lowercase");
  if (config.includeNumbers) parts.push("Numbers");
  if (config.includeSymbols) parts.push("Symbols");
  if (config.excludeAmbiguous) parts.push("Ambiguous characters removed");

  return parts;
}

export function generatePassword(config: GeneratorConfig): PasswordResult {
  const normalized = normalizeConfig(config);

  const value =
    normalized.mode === "random"
      ? generateRandomPassword(normalized)
      : normalized.mode === "memorable"
        ? generateMemorablePassword(normalized)
        : generatePin(normalized);

  return {
    value,
    analysis: analyzePassword(value),
    composition: describeComposition(normalized, value),
  };
}
