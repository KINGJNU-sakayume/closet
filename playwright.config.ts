import { defineConfig } from '@playwright/test';

// 프록시 뒤에서 돌 때(클라우드 개발 환경)는 배경 제거 모델을 받도록 프록시를 쓰고, 로컬 개발 서버는 바로 붙는다.
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5173', proxy, ignoreHTTPSErrors: !!proxy },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://localhost:5173', reuseExistingServer: true },
});
