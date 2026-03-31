"use client";

import { useEffect, useState } from "react";

import { generatePassword, normalizeConfig } from "@/lib/password-generator";
import { defaultConfig, modeGuidance, templates } from "@/lib/templates";
import type { GeneratorConfig, PasswordMode, PasswordResult, TemplateDefinition } from "@/lib/types";

const STORAGE_KEY = "password-generator-preferences";

const separators = ["-", ".", "_", "~"];
const placeholderPassword = "Ready to generate securely";

function readPreferences() {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultConfig;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<GeneratorConfig>;
    return normalizeConfig({
      ...defaultConfig,
      ...parsed,
    });
  } catch {
    return defaultConfig;
  }
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index <= score ? "bg-[var(--accent)]" : "bg-[var(--line)]"
          }`}
        />
      ))}
    </div>
  );
}

function ModeButton({
  active,
  mode,
  onClick,
}: {
  active: boolean;
  mode: PasswordMode;
  onClick: (mode: PasswordMode) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[var(--ink)] text-[var(--surface)] shadow-[0_12px_24px_rgba(3,18,24,0.18)]"
          : "bg-white/70 text-[var(--muted)] ring-1 ring-[var(--line)] hover:bg-white"
      }`}
    >
      {modeGuidance[mode].title}
    </button>
  );
}

export function PasswordGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(defaultConfig);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [copyLabel, setCopyLabel] = useState("Copy password");

  useEffect(() => {
    const hydrated = readPreferences();
    setConfig(hydrated);
    try {
      setResult(generatePassword(hydrated));
      setError(null);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate a password.");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  function updateConfig(next: Partial<GeneratorConfig>, shouldRegenerate = true) {
    const merged = normalizeConfig({
      ...config,
      ...next,
    });
    setConfig(merged);
    if (shouldRegenerate) {
      try {
        setResult(generatePassword(merged));
        setError(null);
      } catch (generationError) {
        setError(generationError instanceof Error ? generationError.message : "Unable to generate a password.");
      }
    }
  }

  function applyTemplate(template: TemplateDefinition) {
    const next = normalizeConfig(template.config);
    setConfig(next);
    setResult(generatePassword(next));
    setError(null);
    setCopyLabel("Copy password");
  }

  function handleModeChange(mode: PasswordMode) {
    const matchingTemplate = templates.find((template) => template.mode === mode);
    if (matchingTemplate) {
      applyTemplate(matchingTemplate);
      return;
    }

    updateConfig({ mode });
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.value);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy password"), 1500);
  }

  function regenerate() {
    try {
      setResult(generatePassword(config));
      setError(null);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate a password.");
    }
  }

  const suggestions =
    result && result.analysis.suggestions.length > 0
      ? result.analysis.suggestions
      : [
          "Use a unique password for every important account.",
          "Save long random passwords in a password manager instead of trying to memorize them.",
        ];

  return (
    <section className="hero-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Generate instantly</p>
          <h2 className="section-title">Strong passwords without second-guessing</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["random", "memorable", "pin"] as PasswordMode[]).map((mode) => (
            <ModeButton key={mode} active={config.mode === mode} mode={mode} onClick={handleModeChange} />
          ))}
        </div>
      </div>

      <div className="result-panel mt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--muted)]">Generated result</p>
            <p className="result-value" aria-live="polite">
              {result ? (isVisible ? result.value : "•".repeat(Math.max(result.value.length, 12))) : placeholderPassword}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" className="ghost-button" onClick={() => setIsVisible((current) => !current)}>
              {isVisible ? "Hide" : "Show"}
            </button>
            <button type="button" className="ghost-button" onClick={regenerate}>
              Refresh
            </button>
            <button type="button" className="primary-button" onClick={handleCopy} disabled={!result}>
              {copyLabel}
            </button>
          </div>
        </div>

        <ScoreBar score={result?.analysis.score ?? 0} />

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-lg font-semibold text-[var(--ink)]">{result?.analysis.label ?? "Local generation only"}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {result?.analysis.detail ??
                "Your password appears only after the page loads on this device, which avoids sending or storing it anywhere else."}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Estimated resistance against slow offline cracking: <strong>{result?.analysis.crackTimeDisplay ?? "Calculated after generation"}</strong>
            </p>
            {result?.analysis.warning ? <p className="mt-3 text-sm text-[var(--danger)]">{result.analysis.warning}</p> : null}
            {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
          </div>
          <div className="quiet-card">
            <p className="text-sm font-semibold text-[var(--ink)]">What this includes</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              {(result?.composition ?? ["Generated in your browser", "No password text saved", "Built for quick copy and safe use"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel panel-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Saved locally on this device</p>
              <h3 className="text-2xl font-semibold text-[var(--ink)]">Fine-tune the generator</h3>
            </div>
            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {modeGuidance[config.mode].title}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <label className="field">
              <span>{config.mode === "memorable" ? "Word count" : "Length"}</span>
              <div className="field-row">
                <input
                  type="range"
                  min={config.mode === "pin" ? 4 : config.mode === "memorable" ? 3 : 8}
                  max={config.mode === "pin" ? 12 : config.mode === "memorable" ? 6 : 64}
                  value={config.mode === "memorable" ? config.wordCount : config.length}
                  onChange={(event) =>
                    updateConfig(
                      config.mode === "memorable"
                        ? { wordCount: Number(event.target.value) }
                        : { length: Number(event.target.value) },
                    )
                  }
                />
                <strong>{config.mode === "memorable" ? config.wordCount : config.length}</strong>
              </div>
            </label>

            {config.mode !== "pin" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config.includeUppercase}
                    onChange={(event) => updateConfig({ includeUppercase: event.target.checked })}
                  />
                  <span>Uppercase letters</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config.includeLowercase}
                    onChange={(event) => updateConfig({ includeLowercase: event.target.checked })}
                  />
                  <span>Lowercase letters</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config.includeNumbers}
                    onChange={(event) => updateConfig({ includeNumbers: event.target.checked })}
                  />
                  <span>Numbers</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config.includeSymbols}
                    onChange={(event) => updateConfig({ includeSymbols: event.target.checked })}
                  />
                  <span>Symbols</span>
                </label>
              </div>
            ) : null}

            {config.mode === "memorable" ? (
              <label className="field">
                <span>Separator</span>
                <div className="flex flex-wrap gap-2">
                  {separators.map((separator) => (
                    <button
                      key={separator}
                      type="button"
                      onClick={() => updateConfig({ separator })}
                      className={`chip ${config.separator === separator ? "chip-active" : ""}`}
                    >
                      {separator}
                    </button>
                  ))}
                </div>
              </label>
            ) : null}

            <label className="toggle">
              <input
                type="checkbox"
                checked={config.excludeAmbiguous}
                onChange={(event) => updateConfig({ excludeAmbiguous: event.target.checked })}
              />
              <span>Exclude confusing characters like O, 0, l, and 1</span>
            </label>
          </div>
        </div>

        <div className="panel panel-soft">
          <p className="eyebrow">When to use this mode</p>
          <h3 className="text-2xl font-semibold text-[var(--ink)]">{modeGuidance[config.mode].title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{modeGuidance[config.mode].description}</p>
          <p className="mt-4 rounded-[22px] bg-[var(--surface-strong)] p-4 text-sm leading-7 text-[var(--ink)]">
            Best for: {modeGuidance[config.mode].recommendedFor}
          </p>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Suggestions</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {suggestions.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 panel panel-soft">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Smart starting points</p>
            <h3 className="text-2xl font-semibold text-[var(--ink)]">Choose a template for the account you are protecting</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Modern guidance favors length, uniqueness, and the right format for the job. These presets keep the decisions simple.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {templates.map((template) => (
            <button key={template.id} type="button" className="template-card" onClick={() => applyTemplate(template)}>
              <span className="template-chip">{template.name}</span>
              <strong className="mt-4 block text-left text-lg text-[var(--ink)]">{template.description}</strong>
              <span className="mt-3 block text-left text-sm leading-7 text-[var(--muted)]">{template.reason}</span>
              <span className="mt-4 block text-left text-sm font-medium text-[var(--ink)]">{template.recommendedFor}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
