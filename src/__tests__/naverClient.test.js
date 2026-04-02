const { generateSignature, buildHeaders, getCredentials } = require("../api/naverClient");

describe("generateSignature", () => {
  it("should generate a valid HMAC-SHA256 signature", () => {
    const sig = generateSignature("1234567890", "GET", "/test", "mysecret");
    expect(typeof sig).toBe("string");
    expect(sig.length).toBeGreaterThan(0);
  });

  it("should produce different signatures for different paths", () => {
    const sig1 = generateSignature("1234567890", "GET", "/path1", "secret");
    const sig2 = generateSignature("1234567890", "GET", "/path2", "secret");
    expect(sig1).not.toBe(sig2);
  });

  it("should produce different signatures for different methods", () => {
    const sig1 = generateSignature("1234567890", "GET", "/test", "secret");
    const sig2 = generateSignature("1234567890", "POST", "/test", "secret");
    expect(sig1).not.toBe(sig2);
  });
});

describe("getCredentials", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return credentials when env vars are set", () => {
    process.env.NAVER_API_KEY = "test-key";
    process.env.NAVER_SECRET_KEY = "test-secret";
    process.env.NAVER_CUSTOMER_ID = "12345";

    const creds = getCredentials();
    expect(creds.apiKey).toBe("test-key");
    expect(creds.secretKey).toBe("test-secret");
    expect(creds.customerId).toBe("12345");
  });

  it("should throw when env vars are missing", () => {
    delete process.env.NAVER_API_KEY;
    delete process.env.NAVER_SECRET_KEY;
    delete process.env.NAVER_CUSTOMER_ID;

    expect(() => getCredentials()).toThrow("인증 정보가 없습니다");
  });
});

describe("buildHeaders", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NAVER_API_KEY: "test-key",
      NAVER_SECRET_KEY: "test-secret",
      NAVER_CUSTOMER_ID: "12345",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should build valid request headers", () => {
    const headers = buildHeaders("GET", "/test");
    expect(headers["X-API-KEY"]).toBe("test-key");
    expect(headers["X-Customer"]).toBe("12345");
    expect(headers["X-Timestamp"]).toBeDefined();
    expect(headers["X-Signature"]).toBeDefined();
    expect(headers["Content-Type"]).toContain("application/json");
  });
});
