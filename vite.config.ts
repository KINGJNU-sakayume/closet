/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages는 https://<owner>.github.io/<repo>/ 아래에 올라간다. 배포 워크플로가 BASE_PATH를 넘긴다.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  // 배경 제거 라이브러리는 동적 import라 미리 묶어 두지 않으면 개발 서버가 첫 사용 때 새로고침된다.
  optimizeDeps: { include: ['@imgly/background-removal'] },
  test: { include: ['src/**/*.test.ts'] },
});
