const {
  generateAdCopy,
  generateAbTest,
  generateBulkAdCopies,
  truncate,
} = require("../adcopy/adCopyGenerator");

describe("truncate", () => {
  it("should not truncate short text", () => {
    expect(truncate("짧은 텍스트", 20)).toBe("짧은 텍스트");
  });

  it("should truncate long text with ellipsis", () => {
    const result = truncate("이것은 매우 긴 텍스트입니다 자르기 테스트", 15);
    expect(result.length).toBeLessThanOrEqual(15);
    expect(result).toContain("…");
  });
});

describe("generateAdCopy", () => {
  it("should generate ad copy for a service", () => {
    const copy = generateAdCopy("요트투어");
    expect(copy).toHaveProperty("title");
    expect(copy).toHaveProperty("description");
    expect(copy).toHaveProperty("displayUrl");
    expect(copy).toHaveProperty("service", "요트투어");
    expect(copy).toHaveProperty("generatedAt");
  });

  it("should respect title length limit (25 chars)", () => {
    const copy = generateAdCopy("요트투어");
    expect(copy.title.length).toBeLessThanOrEqual(25);
  });

  it("should respect description length limit (45 chars)", () => {
    const copy = generateAdCopy("요트투어");
    expect(copy.description.length).toBeLessThanOrEqual(45);
  });

  it("should generate multiple variants", () => {
    const copies = generateAdCopy("선셋크루즈", { variants: 3 });
    expect(Array.isArray(copies)).toBe(true);
    expect(copies).toHaveLength(3);
  });

  it("should throw when service is missing", () => {
    expect(() => generateAdCopy()).toThrow("서비스명은 필수");
  });
});

describe("generateAbTest", () => {
  it("should generate A/B test variants", () => {
    const test = generateAbTest("요트투어");
    expect(test.control.variant).toBe("A");
    expect(test.test.variant).toBe("B");
    expect(test.service).toBe("요트투어");
  });
});

describe("generateBulkAdCopies", () => {
  it("should generate copies for all services", () => {
    const bulk = generateBulkAdCopies();
    expect(bulk).toHaveProperty("요트투어");
    expect(bulk).toHaveProperty("선셋크루즈");
    expect(bulk).toHaveProperty("요트파티");
    expect(bulk).toHaveProperty("요트대여");
    expect(bulk).toHaveProperty("낚시투어");
  });

  it("should generate 3 variants per service", () => {
    const bulk = generateBulkAdCopies();
    expect(bulk["요트투어"]).toHaveLength(3);
  });
});
