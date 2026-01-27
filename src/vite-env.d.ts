/// <reference types="vite/client" />

declare const umami: {
  track: (event: string, data?: Record<string, unknown>) => void;
};
