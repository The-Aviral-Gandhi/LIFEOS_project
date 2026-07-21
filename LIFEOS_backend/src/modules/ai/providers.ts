import { env } from "../../config/env";
import { logger } from "../../config/logger";

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  complete(systemPrompt: string, userPrompt: string): Promise<string>;
}

class OpenAIProvider implements AIProvider {
  name = "openai";
  isConfigured() {
    return Boolean(env.OPENAI_API_KEY);
  }
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI request failed: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

class GeminiProvider implements AIProvider {
  name = "gemini";
  isConfigured() {
    return Boolean(env.GEMINI_API_KEY);
  }
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }] }),
      }
    );
    if (!resp.ok) throw new Error(`Gemini request failed: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}

class AnthropicProvider implements AIProvider {
  name = "anthropic";
  isConfigured() {
    return Boolean(env.ANTHROPIC_API_KEY);
  }
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!resp.ok) throw new Error(`Anthropic request failed: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data.content?.[0]?.text ?? "";
  }
}

/** Grok — xAI's OpenAI-compatible chat completions endpoint. */
class GrokProvider implements AIProvider {
  name = "grok";
  isConfigured() {
    return Boolean(env.GROK_API_KEY);
  }
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const resp = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROK_API_KEY}` },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`Grok request failed: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

class OpenRouterProvider implements AIProvider {
  name = "openrouter";
  isConfigured() {
    return Boolean(env.OPENROUTER_API_KEY);
  }
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`OpenRouter request failed: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

const registry: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
  grok: new GrokProvider(),
  openrouter: new OpenRouterProvider(),
  anthropic: new AnthropicProvider(),
};

/** Priority order used when AI_PROVIDER=auto, or as the fallback chain after an explicit provider fails. */
const FALLBACK_ORDER = ["gemini", "openai", "grok", "openrouter", "anthropic"];

/**
 * Runs the prompt against the configured provider. If AI_PROVIDER=auto, or if the
 * explicitly configured provider throws, walks the fallback chain until one succeeds.
 * Never throws for "no provider available" — returns a clear, honest fallback message instead,
 * so the frontend never sees a raw 500 or a fake AI answer.
 */
export async function runAICompletion(systemPrompt: string, userPrompt: string): Promise<{ text: string; provider: string | null }> {
  const orderedCandidates =
    env.AI_PROVIDER === "auto" || env.AI_PROVIDER === "none"
      ? FALLBACK_ORDER
      : [env.AI_PROVIDER, ...FALLBACK_ORDER.filter((p) => p !== env.AI_PROVIDER)];

  const configured = orderedCandidates.map((name) => registry[name]).filter((p) => p?.isConfigured());

  if (configured.length === 0) {
    return {
      text:
        "AI features aren't configured yet. Add an API key for at least one provider " +
        "(GEMINI_API_KEY, OPENAI_API_KEY, GROK_API_KEY, OPENROUTER_API_KEY, or ANTHROPIC_API_KEY) to your .env file.",
      provider: null,
    };
  }

  let lastError: Error | null = null;
  for (const provider of configured) {
    try {
      const text = await provider.complete(systemPrompt, userPrompt);
      return { text, provider: provider.name };
    } catch (err) {
      lastError = err as Error;
      logger.warn({ provider: provider.name, err: lastError.message }, "AI provider failed, trying next in fallback chain");
    }
  }

  return {
    text: `All configured AI providers are currently unavailable (last error: ${lastError?.message ?? "unknown"}). Please try again shortly.`,
    provider: null,
  };
}
