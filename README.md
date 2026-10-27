# 옷장×코디 (Closet / Look)

개인용 웹앱. 빌드 기준은 `reference/`(시안·예시 데이터)와 빌드 지시서.

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run e2e        # Playwright (스크린샷: e2e/screens/)
npm run build
```

개발용 컴포넌트 모음: `/dev/components`

## 배포 (GitHub Pages)

`main`에 머지되면 `.github/workflows/deploy.yml`이 테스트 → 빌드 → 배포합니다.
주소: https://kingjnu-sakayume.github.io/closet/

- 처음 한 번: 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꿉니다.
- 앱은 `/closet/` 아래에서 돕니다. 코드에서 `public/` 파일을 가리킬 때는 `` `${import.meta.env.BASE_URL}assets/look.png` ``처럼 씁니다(`/assets/...` 금지).
- `/closet/explore` 같은 주소로 바로 들어와도 열리도록 빌드 때 `404.html`을 `index.html`과 같게 둡니다.
