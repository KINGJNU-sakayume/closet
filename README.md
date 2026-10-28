# 옷장×코디 (Closet / Look)

개인용 웹앱. 빌드 기준은 `reference/`(시안·예시 데이터)와 빌드 지시서.

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run e2e        # Playwright (스크린샷: e2e/screens/)
npm run build
```

개발용 컴포넌트 모음과 예시 데이터 판정 결과: `/dev/components`

## 데이터

- 첫 실행 때 `src/data/seed.json`(옷·코디·쇼핑 리스트)을 IndexedDB에 넣습니다. 룩은 `public/looks/*.json`(순서는 `index.json`).
- 개발용: 주소 뒤에 `?reset=1`이면 예시 데이터를 다시 넣고, `?empty=1`이면 비웁니다.
- 판정 규칙: `src/domain/matching.ts`, 점수·기준값: `src/domain/matching.config.ts`, 테스트: `src/domain/matching.test.ts`.

## 옷 등록과 배경 제거

- 배경 제거는 브라우저 안에서 [@imgly/background-removal](https://github.com/imgly/background-removal-js)로 합니다. 처음 한 번 모델 파일(약 44MB)과 실행 파일(약 12MB)을 IMG.LY 서버(staticimgly.com)에서 내려받고, 이후는 브라우저 캐시를 씁니다.
- 이 라이브러리가 **AGPL-3.0**이라 앱도 같은 조건을 따릅니다(아래 '라이선스').
- 상품 링크 등록은 주소만 구매처로 저장합니다(쇼핑몰 페이지를 읽어 오지 않음).

## 배포 (GitHub Pages)

`main`에 머지되면 `.github/workflows/deploy.yml`이 테스트 → 빌드 → 배포합니다.
주소: https://kingjnu-sakayume.github.io/closet/

- 처음 한 번: 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꿉니다.
- 앱은 `/closet/` 아래에서 돕니다. 코드에서 `public/` 파일을 가리킬 때는 `` `${import.meta.env.BASE_URL}assets/look.png` ``처럼 씁니다(`/assets/...` 금지).
- `/closet/explore` 같은 주소로 바로 들어와도 열리도록 빌드 때 `404.html`을 `index.html`과 같게 둡니다.

## 라이선스

- 코드: [GNU AGPL v3.0 이상](LICENSE) (`AGPL-3.0-or-later`). 배경 제거 라이브러리 @imgly/background-removal의 AGPL-3.0을 따릅니다. 웹으로 배포하면 사용자가 소스를 받을 수 있어야 하며, 소스는 이 저장소입니다.
- `reference/`와 `public/assets/`의 이미지(무신사 룩 사진, 쇼핑몰 상품 사진)는 이 라이선스에 포함되지 않습니다. 개인 테스트용이며 재배포하지 않습니다.
