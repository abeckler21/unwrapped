import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

import { env } from '@/lib/env'

/**
 * Returns the appropriate LLM for the current environment.
 *
 * - Production (GROQ_API_KEY set): Groq's llama-3.3-70b-versatile (free tier)
 * - Local dev (no GROQ_API_KEY):   Ollama via OpenAI-compatible API
 *
 * Callers import `generateText` from 'ai' directly and pass the model here.
 * Example:
 *   import { generateText } from 'ai'
 *   import { getModel } from '@/lib/ai/client'
 *   const { text } = await generateText({ model: getModel(), prompt: '...' })
 */
export function getModel(): LanguageModel {
  if (env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: env.GROQ_API_KEY })
    return groq('llama-3.3-70b-versatile')
  }

  // Local dev: Ollama must be running (`ollama run llama3.2`)
  const ollama = createOpenAI({
    baseURL: env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    apiKey: 'ollama',
    name: 'ollama',
  })
  return ollama('llama3.2')
}
