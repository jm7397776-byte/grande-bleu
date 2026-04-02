const { services, companyInfo } = require("../data/services");

const inquiryStatuses = {
  NEW: "new",
  REPLIED: "replied",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

function createInquiry({ customerName, phone, email, serviceType, date, guestCount, message }) {
  if (!customerName || !phone || !serviceType) {
    throw new Error("customerName, phone, serviceType are required");
  }

  const service = services[serviceType];
  if (!service) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }

  if (guestCount && guestCount > service.capacity.max) {
    throw new Error(
      `${service.name}의 최대 인원은 ${service.capacity.max}명입니다. (요청: ${guestCount}명)`,
    );
  }

  if (guestCount && guestCount < service.capacity.min) {
    throw new Error(
      `${service.name}의 최소 인원은 ${service.capacity.min}명입니다. (요청: ${guestCount}명)`,
    );
  }

  return {
    id: generateInquiryId(),
    customerName,
    phone,
    email: email || null,
    serviceType,
    serviceName: service.name,
    date: date || null,
    guestCount: guestCount || null,
    message: message || "",
    status: inquiryStatuses.NEW,
    createdAt: new Date().toISOString(),
    replies: [],
  };
}

function generateInquiryId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `INQ-${timestamp}-${random}`.toUpperCase();
}

function generateAutoReply(inquiry) {
  const service = services[inquiry.serviceType];
  const dateInfo = inquiry.date ? `\n희망 날짜: ${inquiry.date}` : "";
  const guestInfo = inquiry.guestCount ? `\n인원: ${inquiry.guestCount}명` : "";

  const reply =
    `${inquiry.customerName}님, 안녕하세요! 🚢\n` +
    `그랑블루에 문의해 주셔서 감사합니다.\n\n` +
    `[문의 내역]\n` +
    `서비스: ${service.name}${dateInfo}${guestInfo}\n\n` +
    `${service.name}는 ${service.duration.join(", ")} 코스로 운영되며,\n` +
    `가격은 ${service.priceRange.from.toLocaleString("ko-KR")}원부터 시작합니다.\n\n` +
    `담당자가 확인 후 빠른 시간 내에 연락드리겠습니다.\n` +
    `급한 문의는 ${companyInfo.phone}으로 전화 부탁드립니다.\n\n` +
    `감사합니다.\n` +
    `${companyInfo.name} 드림`;

  return {
    inquiryId: inquiry.id,
    to: inquiry.customerName,
    channel: inquiry.email ? "email" : "sms",
    destination: inquiry.email || inquiry.phone,
    subject: `[${companyInfo.name}] ${service.name} 문의 접수 안내`,
    body: reply,
    generatedAt: new Date().toISOString(),
  };
}

function generateConfirmation(inquiry, confirmedDetails) {
  const { date, time, duration, price, notes } = confirmedDetails;

  const message =
    `${inquiry.customerName}님, 안녕하세요!\n` +
    `그랑블루 ${inquiry.serviceName} 예약이 확정되었습니다. ✅\n\n` +
    `[예약 정보]\n` +
    `📅 날짜: ${date}\n` +
    `⏰ 시간: ${time}\n` +
    `⏱ 소요시간: ${duration}\n` +
    `👥 인원: ${inquiry.guestCount || "미정"}명\n` +
    `💰 금액: ${price.toLocaleString("ko-KR")}원\n` +
    (notes ? `📝 참고: ${notes}\n` : "") +
    `\n📍 탑승 장소는 예약일 전날 안내드리겠습니다.\n` +
    `\n문의: ${companyInfo.phone}\n` +
    `${companyInfo.name} 드림`;

  return {
    inquiryId: inquiry.id,
    to: inquiry.customerName,
    channel: inquiry.email ? "email" : "sms",
    destination: inquiry.email || inquiry.phone,
    subject: `[${companyInfo.name}] 예약 확정 안내`,
    body: message,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createInquiry,
  generateAutoReply,
  generateConfirmation,
  generateInquiryId,
  inquiryStatuses,
};
