import { getBillabilityConfig } from "./billability.config";

describe("Billability Configuration", () => {
  it("should return ideal billability ratio as decimal", () => {
    const config = getBillabilityConfig();

    expect(config.idealRatio).toBe(0.75);
    expect(typeof config.idealRatio).toBe("number");
  });

  it("should return ideal billability ratio as percentage", () => {
    const config = getBillabilityConfig();

    expect(config.idealRatioPercentage).toBe(75);
    expect(typeof config.idealRatioPercentage).toBe("number");
  });

  it("should provide readable description", () => {
    const config = getBillabilityConfig();

    expect(config.description).toBe(
      "Ideal billability ratio target for team performance",
    );
    expect(typeof config.description).toBe("string");
  });
});
