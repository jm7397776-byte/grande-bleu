#!/bin/bash
echo "============================================"
echo "  그랑블루요트 광고 자동화 설치 시작"
echo "============================================"
echo ""

# 1. Node.js 확인 및 설치
if ! command -v node &> /dev/null; then
    echo "Node.js를 설치합니다..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew를 먼저 설치합니다..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node
    echo "Node.js 설치 완료!"
else
    echo "Node.js 이미 설치됨: $(node -v)"
fi

# 2. 프로젝트 폴더로 이동
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo ""
echo "프로젝트 경로: $SCRIPT_DIR"

# 3. 의존성 설치
echo ""
echo "필요한 패키지를 설치합니다..."
npm install
echo "패키지 설치 완료!"

# 4. .env 파일 확인
echo ""
if [ -f .env ]; then
    echo ".env 파일 확인됨"
else
    echo ".env 파일을 생성합니다..."
    echo "NAVER_API_KEY=여기에_API_KEY_붙여넣기" > .env
    echo "NAVER_SECRET_KEY=여기에_SECRET_KEY_붙여넣기" >> .env
    echo "NAVER_CUSTOMER_ID=여기에_CUSTOMER_ID_붙여넣기" >> .env
    echo ""
    echo "⚠️  .env 파일에 실제 API 키를 입력해주세요!"
    echo "    파일 위치: $SCRIPT_DIR/.env"
fi

# 5. 연동 테스트
echo ""
echo "============================================"
echo "  API 연동 테스트"
echo "============================================"
node -e "
const client = require('./src/api/naverClient');
client.get('/ncc/campaigns')
  .then(data => {
    console.log('');
    console.log('✅ API 연동 성공!');
    if (Array.isArray(data)) {
      console.log('캠페인 수:', data.length);
      data.forEach(c => console.log('  -', c.name || c.nccCampaignId));
    } else {
      console.log('응답:', JSON.stringify(data, null, 2));
    }
  })
  .catch(err => {
    console.log('');
    console.log('❌ 연결 실패:', err.message);
    console.log('');
    console.log('.env 파일의 API 키를 확인해주세요.');
  });
"

echo ""
echo "============================================"
echo "  설치 완료!"
echo ""
echo "  자동화 실행: ./run.sh"
echo "============================================"
