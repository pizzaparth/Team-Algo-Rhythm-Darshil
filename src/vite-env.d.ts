/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIMO_API_KEY: string;
  readonly VITE_MIMO_MODEL: string;
  readonly VITE_TAVILY_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
