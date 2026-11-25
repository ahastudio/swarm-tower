# Swarm Tower

동전을 모아 타워를 짓고, 적으로부터 본부를 지키는 브라우저 타워 디펜스 게임입니다.
결국은 얼마나 오래 버티는지, 생존 시간을 보는 게임입니다.

## Sprite Stacking

캐릭터, 건물, 소품은 **Sprite Stacking**으로 그립니다.
물체를 가로로 얇게 썬 2D slice 여러 장을 쌓고, 카메라 회전에 맞춰 slice마다 돌려 그려서 3D 모델 없이 입체로 보이게 합니다.
TypeScript와 Canvas 2D만 쓰며 3D 엔진은 없습니다.

## 설치

Node 22 이상과 pnpm이 필요합니다(`.nvmrc` 참고).

```sh
pnpm install
```

## 실행

```sh
pnpm dev
```

브라우저에서 <http://localhost:52589>를 열고 타이틀의 「시작」을 누릅니다.

## 빌드

```sh
pnpm build
```

결과는 `dist/`에 정적 파일로 나옵니다.

## 조작

| 입력 | 동작 |
| --- | --- |
| 클릭 / 터치, WASD, 방향키 | 주인공 이동 |
| 마우스 휠 | 확대·축소 |
| 오른쪽 버튼 드래그 | 카메라 회전과 기울기 |
| 가운데 버튼 드래그 | 카메라 이동 |

## 확인

```sh
pnpm check
```

타입 검사, 린트(Biome, ESLint), 테스트 커버리지 100%, 코드 품질 점수 95 이상을 한 번에 확인합니다.
개별 명령은 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm score`입니다.

## 구성

| 경로 | 내용 |
| --- | --- |
| `src/` | 게임 코드 |
| `public/sprites/` | 스프라이트 이미지와 `manifest.json` |
| `public/styles/` | 화면 CSS(타이틀, 로딩, 게임 오버, HUD) |
| `specs/` | 기능별 기획서(`README.md`, `spec.md`, `plan.md`, `tasks.md`, `findings.md`, `progress.md`) |
| `_agent/` | 에이전트용 규칙(`rules/`)과 스킬(`skills/`). `.claude/`가 가리킵니다 |
| `scripts/checks/` | `pnpm check`가 쓰는 검사 스크립트 |

## 라이선스

그래픽 애셋을 제외하고 [MIT 라이선스](LICENSE)로 공개합니다.
