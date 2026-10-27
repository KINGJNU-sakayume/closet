/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages는 https://<owner>.github.io/<repo>/ 아래에 올라간다. 배포 워크플로가 BASE_PATH를 넘긴다.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  test: { include: ['src/**/*.test.ts'] },
});
