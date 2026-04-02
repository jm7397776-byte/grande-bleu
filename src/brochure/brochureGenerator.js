const { services, companyInfo } = require("../data/services");

function generateBrochure(serviceType, options = {}) {
  const service = services[serviceType];
  if (!service) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }

  const { language = "ko" } = options;

  if (language === "en") {
    return generateEnglishBrochure(service, serviceType, options);
  }

  return generateKoreanBrochure(service, serviceType, options);
}

function generateKoreanBrochure(service, serviceType, options) {
  const { customerName, guestCount, preferredDate } = options;

  const personalGreeting = customerName ? `${customerName}님을 위한 ` : "";

  const sections = {
    title: `${companyInfo.name} - ${personalGreeting}${service.name} 안내`,
    intro:
      `안녕하세요, ${companyInfo.name}입니다.\n` +
      `"${companyInfo.tagline}" - ${service.description}\n`,
    serviceDetails: {
      heading: "서비스 안내",
      items: [
        `서비스: ${service.name}`,
        `운영 시간: ${service.duration.join(" / ")}`,
        `인원: ${service.capacity.min}~${service.capacity.max}명`,
        `가격: ${service.priceRange.from.toLocaleString("ko-KR")}원 ~ ${service.priceRange.to.toLocaleString("ko-KR")}원`,
        `운영 시즌: ${service.seasons.join(", ")}`,
      ],
    },
    highlights: {
      heading: "프로그램 하이라이트",
      items: service.highlights,
    },
    customInfo: buildCustomSection(guestCount, preferredDate, service),
    pricing: buildPricingSection(service, guestCount),
    contact: {
      heading: "예약 및 문의",
      items: [
        `전화: ${companyInfo.phone}`,
        `이메일: ${companyInfo.email}`,
        `인스타그램: ${companyInfo.instagram}`,
        `웹사이트: ${companyInfo.website}`,
      ],
    },
    footer: `${companyInfo.name} | ${companyInfo.tagline}`,
  };

  return {
    serviceType,
    language: "ko",
    sections,
    plainText: renderPlainText(sections),
    generatedAt: new Date().toISOString(),
  };
}

function generateEnglishBrochure(service, serviceType, options) {
  const { customerName } = options;

  const personalGreeting = customerName ? `For ${customerName} - ` : "";

  const sections = {
    title: `${companyInfo.nameEn} - ${personalGreeting}${service.nameEn}`,
    intro:
      `Welcome to ${companyInfo.nameEn}.\n` +
      `Experience an unforgettable time on the ocean with our premium yacht services.\n`,
    serviceDetails: {
      heading: "Service Details",
      items: [
        `Service: ${service.nameEn}`,
        `Duration: ${service.duration.join(" / ")}`,
        `Capacity: ${service.capacity.min}-${service.capacity.max} guests`,
        `Price: From KRW ${service.priceRange.from.toLocaleString("ko-KR")}`,
        `Seasons: ${service.seasons.join(", ")}`,
      ],
    },
    highlights: {
      heading: "Highlights",
      items: service.highlights,
    },
    contact: {
      heading: "Reservations & Inquiries",
      items: [
        `Phone: ${companyInfo.phone}`,
        `Email: ${companyInfo.email}`,
        `Instagram: ${companyInfo.instagram}`,
        `Website: ${companyInfo.website}`,
      ],
    },
    footer: `${companyInfo.nameEn} | A Special Experience on the Sea`,
  };

  return {
    serviceType,
    language: "en",
    sections,
    plainText: renderPlainText(sections),
    generatedAt: new Date().toISOString(),
  };
}

function buildCustomSection(guestCount, preferredDate, service) {
  if (!guestCount && !preferredDate) {
    return null;
  }

  const items = [];
  if (preferredDate) {
    items.push(`희망 날짜: ${preferredDate}`);
  }
  if (guestCount) {
    items.push(`예상 인원: ${guestCount}명`);
    if (guestCount > service.capacity.max) {
      items.push(
        `⚠️ 최대 인원(${service.capacity.max}명) 초과 - 별도 상담이 필요합니다.`,
      );
    }
  }

  return {
    heading: "맞춤 정보",
    items,
  };
}

function buildPricingSection(service, guestCount) {
  const items = [
    `기본 가격: ${service.priceRange.from.toLocaleString("ko-KR")}원~`,
  ];

  if (guestCount) {
    const estimatedPrice = Math.round(
      service.priceRange.from + (service.priceRange.to - service.priceRange.from) * (guestCount / service.capacity.max) * 0.7,
    );
    items.push(`예상 견적 (${guestCount}명 기준): 약 ${estimatedPrice.toLocaleString("ko-KR")}원`);
    items.push("* 정확한 금액은 상담 후 안내드립니다.");
  }

  return {
    heading: "가격 안내",
    items,
  };
}

function renderPlainText(sections) {
  const lines = [];

  lines.push("=".repeat(50));
  lines.push(sections.title);
  lines.push("=".repeat(50));
  lines.push("");
  lines.push(sections.intro);

  const sectionKeys = ["serviceDetails", "highlights", "customInfo", "pricing", "contact"];
  for (const key of sectionKeys) {
    const section = sections[key];
    if (!section) {
      continue;
    }
    lines.push("");
    lines.push(`▶ ${section.heading}`);
    lines.push("-".repeat(30));
    for (const item of section.items) {
      lines.push(`  • ${item}`);
    }
  }

  lines.push("");
  lines.push("-".repeat(50));
  lines.push(sections.footer);

  return lines.join("\n");
}

module.exports = {
  generateBrochure,
  buildCustomSection,
  buildPricingSection,
  renderPlainText,
};
