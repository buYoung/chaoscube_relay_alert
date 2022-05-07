# 카오스큐브 레더 현황판
### 내용
1. 카오스큐브 레더의 릴레이버스 게시판을 실시간으로 감시합니다(주기 10초) 최대 10개 게시물
2. 목록은 최대 20개까지 출력됨.
3. 우버디아의 상황판도 실시간 갱신 (주기 10초)

### 빌드 조건
1. electron-builder을 Global로 설치한 상태인 경우 (npm install -g electron-builder)
2. nodejs 16.x 이상인경우
### 빌드방법
1. git 소스받은후 npm i 입력
2. 완료되면 index.js가 있는 폴더로 가서 "electron-builder build" 입력
3dist - win-unpacked 폴더에 exe파일 실행 끘!