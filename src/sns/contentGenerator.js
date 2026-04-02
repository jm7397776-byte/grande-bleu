const { services, companyInfo } = require("../data/services");

const hashtagSets = {
  tour: [
    "#요트투어",
    "#바다여행",
    "#크루즈",
    "#선셋크루즈",
    "#해양관광",
    "#요트여행",
    "#바다뷰",
    "#오션뷰",
  ],
  party: [
    "#요트파티",
    "#프라이빗파티",
    "#요트이벤트",
    "#바다파티",
    "#특별한하루",
    "#파티플래너",
  ],
  charter: [
    "#요트대여",
    "#요트차터",
    "#프라이빗요트",
    "#요트렌탈",
    "#자유여행",
    "#프리미엄",
  ],
  common: [
    "#그랑블루",
    "#GrandeBleu",
    "#요트",
    "#yacht",
    `#${companyInfo.location}요트`,
    `#${companyInfo.location}여행`,
    `#${companyInfo.location}`,
  ],
};

const captionTemplates = {
  tour: [
    `🚢 ${companyInfo.location}의 아름다운 바다를 요트 위에서 만나보세요.\n\n{highlight} 코스로 특별한 추억을 만들어 드립니다.\n\n⏱ {duration} | 👥 최대 {capacity}명\n💰 {price}원~\n\n📞 예약문의: ${companyInfo.phone}\n📩 ${companyInfo.email}`,
    `✨ 오늘 같은 날, 바다 위에서 힐링 어떠세요?\n\n그랑블루 {highlight}와 함께라면 일상에서 벗어나 특별한 시간을 보낼 수 있어요.\n\n📍 ${companyInfo.location}\n📞 ${companyInfo.phone}`,
    `🌊 파란 바다 위, 그랑블루와 함께하는 {highlight}\n\n{duration} 동안 잊지 못할 추억을 만들어 보세요.\n예약은 DM 또는 전화로!\n\n📞 ${companyInfo.phone}`,
  ],
  party: [
    `🎉 특별한 날, 요트 위에서 보내세요!\n\n{highlight}을 그랑블루 프라이빗 요트에서.\n\n👥 {capacity}명까지 | ⏱ {duration}\n🎵 음향/조명 완비\n\n📞 ${companyInfo.phone}\n📩 ${companyInfo.email}`,
    `🥂 바다 위에서 펼쳐지는 프라이빗 {highlight}\n\n케이터링, 데코레이션, 음향까지 올인원 패키지로 준비해드립니다.\n\n📍 ${companyInfo.location}\n📞 예약: ${companyInfo.phone}`,
    `✨ 인생에서 가장 특별한 순간을 바다 위에서.\n\n그랑블루의 {highlight} 패키지로 잊지 못할 하루를 만들어 보세요.\n\nDM으로 문의 주세요! 📩`,
  ],
  charter: [
    `⛵ 나만의 프라이빗 요트, 그랑블루 차터\n\n{highlight} 코스를 원하는 대로 자유롭게.\n\n⏱ {duration} | 👥 최대 {capacity}명\n💰 {price}원~\n\n📞 ${companyInfo.phone}`,
    `🌅 자유로운 바다 여행을 꿈꾸시나요?\n\n그랑블루 요트 차터로 {highlight}을 즐겨보세요.\n코스와 일정을 원하는 대로 맞춤 설계해드립니다.\n\n📞 ${companyInfo.phone}`,
    `🚤 ${companyInfo.location} 바다를 온전히 내 것으로.\n\n{duration} 동안 프라이빗 요트에서 {highlight}을 경험하세요.\n\n예약 및 문의\n📞 ${companyInfo.phone}\n📩 ${companyInfo.email}`,
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatPrice(price) {
  return price.toLocaleString("ko-KR");
}

function generateCaption(serviceType) {
  const service = services[serviceType];
  if (!service) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }

  const templates = captionTemplates[serviceType];
  const template = pickRandom(templates);

  const caption = template
    .replace(/\{highlight\}/g, pickRandom(service.highlights))
    .replace(/\{duration\}/g, pickRandom(service.duration))
    .replace(/\{capacity\}/g, String(service.capacity.max))
    .replace(/\{price\}/g, formatPrice(service.priceRange.from));

  return caption;
}

function generateHashtags(serviceType, count = 10) {
  const serviceHashtags = hashtagSets[serviceType] || [];
  const commonHashtags = hashtagSets.common;
  const allHashtags = [...serviceHashtags, ...commonHashtags];

  const shuffled = allHashtags.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).join(" ");
}

function generatePost(serviceType) {
  const caption = generateCaption(serviceType);
  const hashtags = generateHashtags(serviceType);

  return {
    serviceType,
    serviceName: services[serviceType].name,
    caption,
    hashtags,
    fullPost: `${caption}\n\n${hashtags}`,
    generatedAt: new Date().toISOString(),
  };
}

function generateWeeklyPlan() {
  const schedule = [
    { day: "월", type: "tour", note: "투어 홍보" },
    { day: "화", type: "party", note: "파티/이벤트 홍보" },
    { day: "수", type: "charter", note: "차터 홍보" },
    { day: "목", type: "tour", note: "고객 후기/리그램" },
    { day: "금", type: "party", note: "주말 파티 홍보" },
    { day: "토", type: "charter", note: "현장 스토리" },
    { day: "일", type: "tour", note: "선셋 크루즈 홍보" },
  ];

  return schedule.map((item) => ({
    ...item,
    post: generatePost(item.type),
  }));
}

module.exports = {
  generateCaption,
  generateHashtags,
  generatePost,
  generateWeeklyPlan,
  pickRandom,
  formatPrice,
};
