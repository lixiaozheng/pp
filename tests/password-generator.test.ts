import { describe, expect, it } from "vitest";

import { generatePassword, normalizeConfig } from "@/lib/password-generator";
import { defaultConfig, templates } from "@/lib/templates";

describe("password generator", () => {
  it("creates random passwords that satisfy the selected rules", () => {
    const result = generatePassword({
      ...defaultConfig,
      mode: "random",
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    });

    expect(result.value).toHaveLength(24);
    expect(result.value).toMatch(/[A-Z]/);
    expect(result.value).toMatch(/[a-z]/);
    expect(result.value).toMatch(/[0-9]/);
    expect(result.value).toMatch(/[!@#$%^&*()[\]{};:,.?\-_=+]/);
    expect(result.value).not.toMatch(/[O0Il1|`'"]/);
  });

  it("creates memorable passphrases with the requested separator and suffix rules", () => {
    const result = generatePassword({
      ...defaultConfig,
      mode: "memorable",
      wordCount: 5,
      separator: ".",
      includeNumbers: true,
      includeSymbols: false,
    });

    expect(result.value.split(".")).toHaveLength(5);
    expect(result.value).toMatch(/[0-9]$/);
  });

  it("creates numeric PINs only", () => {
    const result = generatePassword({
      ...defaultConfig,
      mode: "pin",
      length: 8,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
    });

    expect(result.value).toHaveLength(8);
    expect(result.value).toMatch(/^\d+$/);
  });

  it("normalizes out-of-range settings by mode", () => {
    const normalizedRandom = normalizeConfig({
      ...defaultConfig,
      mode: "random",
      length: 200,
    });
    const normalizedPin = normalizeConfig({
      ...defaultConfig,
      mode: "pin",
      length: 2,
    });
    const normalizedMemorable = normalizeConfig({
      ...defaultConfig,
      mode: "memorable",
      wordCount: 10,
    });

    expect(normalizedRandom.length).toBe(64);
    expect(normalizedPin.length).toBe(4);
    expect(normalizedMemorable.wordCount).toBe(6);
  });

  it("keeps templates valid", () => {
    for (const template of templates) {
      const result = generatePassword(template.config);
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.analysis.label.length).toBeGreaterThan(0);
    }
  });

  it("throws when a random password has no available character pools", () => {
    expect(() =>
      generatePassword({
        ...defaultConfig,
        mode: "random",
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      }),
    ).toThrow("Choose at least one character type.");
  });
});
