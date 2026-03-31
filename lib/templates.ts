import type { GeneratorConfig, PasswordMode, TemplateDefinition } from "@/lib/types";

export const defaultConfig: GeneratorConfig = {
  mode: "memorable",
  length: 20,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: true,
  wordCount: 4,
  separator: "-",
};

export const modeGuidance: Record<
  PasswordMode,
  {
    title: string;
    description: string;
    recommendedFor: string;
  }
> = {
  random: {
    title: "Random password",
    description: "Best when you can save it in a password manager and never need to remember it yourself.",
    recommendedFor: "Banking, shopping, work tools, and any long-term account.",
  },
  memorable: {
    title: "Memorable passphrase",
    description: "Long, readable, and easier to type. Great when you may need to enter it manually.",
    recommendedFor: "Everyday logins, Wi-Fi, device unlocks, or shared household credentials.",
  },
  pin: {
    title: "PIN code",
    description: "Short numeric secrets for systems that only allow digits.",
    recommendedFor: "ATM-style PINs, door pads, SIM locks, or legacy numeric forms.",
  },
};

export const templates: TemplateDefinition[] = [
  {
    id: "everyday-account",
    name: "Everyday account",
    mode: "memorable",
    description: "A readable passphrase for common personal logins.",
    reason: "Easy to type, long enough to stay strong, and friendly for accounts you revisit often.",
    recommendedFor: "Email, streaming, shopping, and social accounts.",
    config: {
      ...defaultConfig,
      mode: "memorable",
      wordCount: 4,
      includeSymbols: false,
      separator: "-",
    },
  },
  {
    id: "banking",
    name: "Banking",
    mode: "random",
    description: "Long random credentials for high-value accounts.",
    reason: "Maximum unpredictability matters most when the account holds money or identity risk.",
    recommendedFor: "Banking, tax, healthcare, and primary email.",
    config: {
      ...defaultConfig,
      mode: "random",
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    },
  },
  {
    id: "work-login",
    name: "Work login",
    mode: "random",
    description: "Long random passwords that still avoid visually confusing characters.",
    reason: "Strong enough for corporate systems, while staying practical if you ever read it from a safe place.",
    recommendedFor: "SSO fallbacks, VPN, admin tools, and client platforms.",
    config: {
      ...defaultConfig,
      mode: "random",
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    },
  },
  {
    id: "wifi-device",
    name: "Wi-Fi / device",
    mode: "memorable",
    description: "A passphrase that is easier to dictate or type on multiple devices.",
    reason: "Long phrases work well when several people may need to enter the secret manually.",
    recommendedFor: "Home Wi-Fi, smart home, tablets, and shared family devices.",
    config: {
      ...defaultConfig,
      mode: "memorable",
      wordCount: 5,
      includeNumbers: true,
      includeSymbols: false,
      separator: ".",
    },
  },
  {
    id: "pin-code",
    name: "PIN code",
    mode: "pin",
    description: "A clean numeric PIN for systems with strict numeric limits.",
    reason: "Short by design, but still randomly generated and easy to enter.",
    recommendedFor: "Keypads, SIM locks, and devices that only support digits.",
    config: {
      ...defaultConfig,
      mode: "pin",
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
    },
  },
];
