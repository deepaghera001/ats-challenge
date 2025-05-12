// aiConfig.ts
import { genkit }   from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ollama }   from 'genkitx-ollama';

////////////////////////////////////////////////////////////////////////////////
// 1. Define a union type and read from environment
////////////////////////////////////////////////////////////////////////////////
type Provider = 'googleai' | 'ollama';

// We cast from process.env to Provider—TypeScript infers the union, not a literal
const GENAI_PROVIDER = (process.env.AI_PROVIDER as Provider) || 'googleai';

////////////////////////////////////////////////////////////////////////////////
// 2. Ollama settings (only used if GENAI_PROVIDER === 'ollama')
////////////////////////////////////////////////////////////////////////////////
// const OLLAMA_MODEL   = 'llama3.2:3b';
const OLLAMA_MODEL   = 'qwen2.5-coder:3b';
const OLLAMA_ADDRESS = 'http://127.0.0.1:11434';

////////////////////////////////////////////////////////////////////////////////
// 3. Build plugin list and default model name
////////////////////////////////////////////////////////////////////////////////
const plugins: any[] = [];
let   modelName = '';

if (GENAI_PROVIDER === 'googleai') {
  plugins.push(googleAI());
  modelName = 'googleai/gemini-2.0-flash';
} else {
  plugins.push(
    ollama({
      models: [{ name: OLLAMA_MODEL }],     // correct `models` array API :contentReference[oaicite:7]{index=7}
      serverAddress: OLLAMA_ADDRESS,
      // Optional extra fields:
      // type: 'chat',                      // 'chat' vs 'generate'
      // requestTimeout: 300_000,           // in ms
    }),
  );
  modelName = `ollama/${OLLAMA_MODEL}`;
}

////////////////////////////////////////////////////////////////////////////////
// 4. Instantiate and export `ai`
////////////////////////////////////////////////////////////////////////////////
export const ai = genkit({
  plugins,
  model: modelName,
});
