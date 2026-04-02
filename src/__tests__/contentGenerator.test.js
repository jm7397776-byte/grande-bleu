const {
  generateCaption,
  generateHashtags,
  generatePost,
  generateWeeklyPlan,
  pickRandom,
  formatPrice,
} = require("../sns/contentGenerator");

describe("pickRandom", () => {
  it("should return an element from the array", () => {
    const arr = ["a", "b", "c"];
    const result = pickRandom(arr);
    expect(arr).toContain(result);
  });
});

describe("formatPrice", () => {
  it("should format price with Korean locale", () => {
    expect(formatPrice(150000)).toBe("150,000");
  });

  it("should format large prices", () => {
    expect(formatPrice(3000000)).toBe("3,000,000");
  });
});

describe("generateCaption", () => {
  it("should generate a caption for tour", () => {
    const caption = generateCaption("tour");
    expect(typeof caption).toBe("string");
    expect(caption.length).toBeGreaterThan(0);
  });

  it("should generate a caption for party", () => {
    const caption = generateCaption("party");
    expect(typeof caption).toBe("string");
    expect(caption.length).toBeGreaterThan(0);
  });

  it("should generate a caption for charter", () => {
    const caption = generateCaption("charter");
    expect(typeof caption).toBe("string");
  });

  it("should throw for unknown service type", () => {
    expect(() => generateCaption("unknown")).toThrow("Unknown service type");
  });
});

describe("generateHashtags", () => {
  it("should return hashtags as a string", () => {
    const hashtags = generateHashtags("tour");
    expect(hashtags).toContain("#");
  });

  it("should respect count limit", () => {
    const hashtags = generateHashtags("tour", 5);
    const tags = hashtags.split(" ");
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it("should include common hashtags pool", () => {
    const hashtags = generateHashtags("tour", 20);
    expect(hashtags).toContain("#그랑블루");
  });
});

describe("generatePost", () => {
  it("should return a complete post object", () => {
    const post = generatePost("tour");
    expect(post).toHaveProperty("serviceType", "tour");
    expect(post).toHaveProperty("serviceName", "요트 투어");
    expect(post).toHaveProperty("caption");
    expect(post).toHaveProperty("hashtags");
    expect(post).toHaveProperty("fullPost");
    expect(post).toHaveProperty("generatedAt");
  });

  it("should combine caption and hashtags in fullPost", () => {
    const post = generatePost("party");
    expect(post.fullPost).toContain(post.caption);
    expect(post.fullPost).toContain(post.hashtags);
  });
});

describe("generateWeeklyPlan", () => {
  it("should return 7 days of content", () => {
    const plan = generateWeeklyPlan();
    expect(plan).toHaveLength(7);
  });

  it("should have posts for each day", () => {
    const plan = generateWeeklyPlan();
    for (const day of plan) {
      expect(day).toHaveProperty("day");
      expect(day).toHaveProperty("type");
      expect(day).toHaveProperty("post");
      expect(day.post).toHaveProperty("fullPost");
    }
  });
});
