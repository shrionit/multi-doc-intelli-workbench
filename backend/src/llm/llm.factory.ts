import { ILLMProvider } from './llm.interface';
import { MockProvider } from './mock.provider';
import { env } from '../config/env';

/**
 * Provider registry: maps provider names to factory functions.
 * To add a new provider:
 *   1. Create a file implementing ILLMProvider (e.g. gemini.provider.ts)
 *   2. Call registerProvider('gemini', () => new GeminiProvider(env.GEMINI_API_KEY))
 *   3. Set LLM_PROVIDER=gemini in .env
 */
const registry = new Map<string, () => ILLMProvider>();

// Register built-in providers
registry.set('mock', () => new MockProvider());

let currentProvider: ILLMProvider | null = null;

/**
 * Register a new LLM provider factory.
 */
export function registerProvider(name: string, factory: () => ILLMProvider): void {
  registry.set(name, factory);
}

/**
 * Get the configured LLM provider (singleton).
 */
export function getLLMProvider(): ILLMProvider {
  if (currentProvider) return currentProvider;

  const providerName = env.LLM_PROVIDER;
  const factory = registry.get(providerName);

  if (!factory) {
    const available = Array.from(registry.keys()).join(', ');
    throw new Error(
      `Unknown LLM provider: "${providerName}". Available: ${available}. ` +
      `Set LLM_PROVIDER in .env to one of: ${available}`,
    );
  }

  currentProvider = factory();
  console.log(`✅ LLM Provider initialized: ${currentProvider.name}`);
  return currentProvider;
}

/**
 * Reset the current provider (useful for testing or hot-swapping).
 */
export function resetProvider(): void {
  currentProvider = null;
}
