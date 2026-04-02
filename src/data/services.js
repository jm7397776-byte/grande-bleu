const services = {
  tour: {
    name: "요트 투어",
    nameEn: "Yacht Tour",
    description: "아름다운 바다 위에서 특별한 관광 경험을 선사합니다.",
    duration: ["1시간", "2시간", "3시간", "반나절", "종일"],
    capacity: { min: 2, max: 20 },
    priceRange: { from: 150000, to: 800000 },
    highlights: [
      "선셋 크루즈",
      "해안선 투어",
      "스노클링 포인트",
      "섬 투어",
      "돌고래 관찰",
    ],
    seasons: ["봄", "여름", "가을"],
  },
  party: {
    name: "요트 파티/이벤트",
    nameEn: "Yacht Party & Event",
    description: "프라이빗 요트에서 잊지 못할 파티와 이벤트를 즐기세요.",
    duration: ["1시간", "2시간", "3시간", "4시간", "반나절", "종일"],
    capacity: { min: 5, max: 30 },
    priceRange: { from: 500000, to: 3000000 },
    highlights: [
      "생일 파티",
      "기업 행사",
      "프로포즈",
      "졸업 파티",
      "촬영/화보",
      "웨딩 리셉션",
    ],
    seasons: ["봄", "여름", "가을", "겨울"],
  },
  charter: {
    name: "요트 대여/차터",
    nameEn: "Yacht Charter",
    description: "원하는 일정과 코스로 프라이빗 요트를 자유롭게 이용하세요.",
    duration: ["1시간", "반나절", "종일", "1박2일", "2박3일"],
    capacity: { min: 2, max: 12 },
    priceRange: { from: 300000, to: 5000000 },
    highlights: [
      "프라이빗 크루즈",
      "낚시 차터",
      "커플 전용",
      "가족 여행",
      "자유 코스",
    ],
    seasons: ["봄", "여름", "가을"],
  },
};

const companyInfo = {
  name: "그랑블루",
  nameEn: "Grande Bleu",
  tagline: "바다 위의 특별한 경험",
  phone: "010-0000-0000",
  email: "info@grandebleu.kr",
  website: "https://grandebleu.kr",
  instagram: "@grandebleu_yacht",
  location: "제주",
};

module.exports = { services, companyInfo };
