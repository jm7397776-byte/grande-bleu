const {
  createInquiry,
  generateAutoReply,
  generateConfirmation,
  inquiryStatuses,
} = require("../reservation/inquiryManager");

describe("createInquiry", () => {
  it("should create a valid inquiry", () => {
    const inquiry = createInquiry({
      customerName: "김철수",
      phone: "010-1234-5678",
      serviceType: "tour",
    });

    expect(inquiry).toHaveProperty("id");
    expect(inquiry.id).toMatch(/^INQ-/);
    expect(inquiry.customerName).toBe("김철수");
    expect(inquiry.serviceName).toBe("요트 투어");
    expect(inquiry.status).toBe(inquiryStatuses.NEW);
  });

  it("should include optional fields", () => {
    const inquiry = createInquiry({
      customerName: "이영희",
      phone: "010-9876-5432",
      email: "lee@test.com",
      serviceType: "party",
      date: "2026-07-15",
      guestCount: 10,
      message: "생일 파티 문의합니다",
    });

    expect(inquiry.email).toBe("lee@test.com");
    expect(inquiry.date).toBe("2026-07-15");
    expect(inquiry.guestCount).toBe(10);
    expect(inquiry.message).toBe("생일 파티 문의합니다");
  });

  it("should throw when required fields are missing", () => {
    expect(() => createInquiry({ customerName: "홍길동" })).toThrow(
      "customerName, phone, serviceType are required",
    );
  });

  it("should throw for unknown service type", () => {
    expect(() =>
      createInquiry({
        customerName: "홍길동",
        phone: "010-1111-2222",
        serviceType: "submarine",
      }),
    ).toThrow("Unknown service type");
  });

  it("should throw when guest count exceeds max capacity", () => {
    expect(() =>
      createInquiry({
        customerName: "홍길동",
        phone: "010-1111-2222",
        serviceType: "charter",
        guestCount: 50,
      }),
    ).toThrow("최대 인원은 12명");
  });

  it("should throw when guest count is below min capacity", () => {
    expect(() =>
      createInquiry({
        customerName: "홍길동",
        phone: "010-1111-2222",
        serviceType: "party",
        guestCount: 1,
      }),
    ).toThrow("최소 인원은 5명");
  });
});

describe("generateAutoReply", () => {
  it("should generate auto reply for inquiry", () => {
    const inquiry = createInquiry({
      customerName: "박지민",
      phone: "010-5555-6666",
      serviceType: "tour",
      date: "2026-08-01",
      guestCount: 4,
    });

    const reply = generateAutoReply(inquiry);

    expect(reply.to).toBe("박지민");
    expect(reply.channel).toBe("sms");
    expect(reply.body).toContain("박지민님");
    expect(reply.body).toContain("요트 투어");
    expect(reply.body).toContain("그랑블루");
  });

  it("should use email channel when email is provided", () => {
    const inquiry = createInquiry({
      customerName: "최수진",
      phone: "010-7777-8888",
      email: "choi@test.com",
      serviceType: "party",
    });

    const reply = generateAutoReply(inquiry);

    expect(reply.channel).toBe("email");
    expect(reply.destination).toBe("choi@test.com");
  });
});

describe("generateConfirmation", () => {
  it("should generate confirmation message", () => {
    const inquiry = createInquiry({
      customerName: "정민호",
      phone: "010-3333-4444",
      serviceType: "charter",
      guestCount: 6,
    });

    const confirmation = generateConfirmation(inquiry, {
      date: "2026-08-15",
      time: "10:00",
      duration: "반나절",
      price: 1500000,
    });

    expect(confirmation.body).toContain("정민호");
    expect(confirmation.body).toContain("예약이 확정");
    expect(confirmation.body).toContain("2026-08-15");
    expect(confirmation.body).toContain("1,500,000원");
  });
});
