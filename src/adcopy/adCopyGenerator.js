const { business } = require("../data/config");

const titleTemplates = [
  `${business.location} {service} - ${business.name}`,
  `{service} {modifier} | ${business.name}`,
  `${business.location} {service} {modifier} - 지금 예약`,
  `${business.name} {service} | {benefit}`,
  `{season} ${business.location} {service} {modifier}`,
];

const descriptionTemplates = [
  `${business.name}에서 특별한 {service}를 경험하세요. {benefit}. 지금 바로 예약!`,
  `${business.location} 인기 {service}! {benefit}. 최대 {discount} 할인 중.`,
  `프라이빗 {service} 전문 ${business.name}. {benefit}. 간편 예약.`,
  `{season} 한정 {service} 이벤트! {benefit}. ${business.name}`,
  `${business.location} No.1 {service}. {benefit}. 후기 {reviewCount}건+`,
];

const modifiers = ["추천", "인기", "가격", "예약", "할인", "이벤트", "특가"];
const benefits = [
  "안전한 운항",
  "프라이빗 전용",
  "소수정원 운영",
  "전문 선장 동행",
  "SNS 인증샷 명소",
  "무료 주차",
  "픽업 서비스",
];
const seasons = ["봄", "여름", "가을", "겨울", "성수기", "비수기"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAdCopy(service, options = {}) {
  if (!service) {
    throw new Error("서비스명은 필수입니다.");
  }

  const {
    season = pickRandom(seasons),
    discount = "10%",
    reviewCount = "500",
    variants = 1,
  } = options;

  const copies = [];
  for (let i = 0; i < variants; i++) {
    const title = pickRandom(titleTemplates)
      .replace(/\{service\}/g, service)
      .replace(/\{modifier\}/g, pickRandom(modifiers))
      .replace(/\{benefit\}/g, pickRandom(benefits))
      .replace(/\{season\}/g, season);

    const description = pickRandom(descriptionTemplates)
      .replace(/\{service\}/g, service)
      .replace(/\{benefit\}/g, pickRandom(benefits))
      .replace(/\{discount\}/g, discount)
      .replace(/\{season\}/g, season)
      .replace(/\{reviewCount\}/g, reviewCount);

    copies.push({
      title: truncate(title, 25),
      description: truncate(description, 45),
      displayUrl: business.landingUrl,
      service,
      generatedAt: new Date().toISOString(),
    });
  }

  return variants === 1 ? copies[0] : copies;
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 1) + "…";
}

function generateAbTest(service, options = {}) {
  const controlCopy = generateAdCopy(service, { ...options, variants: 1 });

  let testCopy = generateAdCopy(service, { ...options, variants: 1 });
  let attempts = 0;
  while (testCopy.title === controlCopy.title && attempts < 10) {
    testCopy = generateAdCopy(service, { ...options, variants: 1 });
    attempts++;
  }

  return {
    service,
    control: { ...controlCopy, variant: "A" },
    test: { ...testCopy, variant: "B" },
    createdAt: new Date().toISOString(),
  };
}

function generateBulkAdCopies() {
  const results = {};
  for (const service of business.services) {
    results[service] = generateAdCopy(service, { variants: 3 });
  }
  return results;
}

module.exports = {
  generateAdCopy,
  generateAbTest,
  generateBulkAdCopies,
  truncate,
  pickRandom,
};
