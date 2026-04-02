const {
  generateBrochure,
  buildCustomSection,
  buildPricingSection,
} = require("../brochure/brochureGenerator");
const { services } = require("../data/services");

describe("generateBrochure", () => {
  it("should generate a Korean brochure for tour", () => {
    const brochure = generateBrochure("tour");

    expect(brochure.language).toBe("ko");
    expect(brochure.serviceType).toBe("tour");
    expect(brochure.sections.title).toContain("그랑블루");
    expect(brochure.sections.title).toContain("요트 투어");
    expect(brochure.plainText).toContain("요트 투어");
  });

  it("should personalize with customer name", () => {
    const brochure = generateBrochure("party", {
      customerName: "김대표",
    });

    expect(brochure.sections.title).toContain("김대표님을 위한");
  });

  it("should generate an English brochure", () => {
    const brochure = generateBrochure("charter", { language: "en" });

    expect(brochure.language).toBe("en");
    expect(brochure.sections.title).toContain("Grande Bleu");
    expect(brochure.sections.title).toContain("Yacht Charter");
  });

  it("should include custom section when guest count is provided", () => {
    const brochure = generateBrochure("tour", { guestCount: 8 });

    expect(brochure.sections.customInfo).not.toBeNull();
    expect(brochure.sections.customInfo.items).toContain("예상 인원: 8명");
  });

  it("should include pricing estimate for guest count", () => {
    const brochure = generateBrochure("charter", { guestCount: 6 });

    const pricingItems = brochure.sections.pricing.items;
    expect(pricingItems.some((item) => item.includes("예상 견적"))).toBe(true);
  });

  it("should throw for unknown service type", () => {
    expect(() => generateBrochure("helicopter")).toThrow(
      "Unknown service type",
    );
  });

  it("should render plain text", () => {
    const brochure = generateBrochure("party");

    expect(brochure.plainText).toContain("=");
    expect(brochure.plainText).toContain("서비스 안내");
    expect(brochure.plainText).toContain("예약 및 문의");
  });
});

describe("buildCustomSection", () => {
  it("should return null when no options provided", () => {
    const result = buildCustomSection(null, null, services.tour);
    expect(result).toBeNull();
  });

  it("should warn about exceeding capacity", () => {
    const result = buildCustomSection(25, null, services.tour);
    expect(result.items.some((item) => item.includes("초과"))).toBe(true);
  });
});

describe("buildPricingSection", () => {
  it("should show base price without guest count", () => {
    const result = buildPricingSection(services.tour);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toContain("기본 가격");
  });

  it("should include estimate with guest count", () => {
    const result = buildPricingSection(services.party, 15);
    expect(result.items.length).toBeGreaterThan(1);
    expect(result.items.some((item) => item.includes("예상 견적"))).toBe(true);
  });
});
