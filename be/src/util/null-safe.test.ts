import { nullSafe } from "./null-safe";

describe("nullSafe", () => {
  describe("checking for array...", () => {
    it("should act as a passthrough if truthy", () => {
      expect(nullSafe.array([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should return an empty array if falsy", () => {
      expect(nullSafe.array(undefined)).toEqual([]);
    });

    it("should return a fallback array if falsy", () => {
      expect(nullSafe.array(undefined, [4, 5])).toEqual([4, 5]);
    });
  });
  describe("checking for string...", () => {
    it("should act as a passthrough if truthy", () => {
      expect(nullSafe.string("hello")).toBe("hello");
    });

    it("should return an empty string if falsy", () => {
      expect(nullSafe.string(undefined)).toBe("");
    });

    it("should return a fallback string if falsy", () => {
      expect(nullSafe.string(undefined, "fallback")).toBe("fallback");
    });
  });

  describe("checking for object...", () => {
    it("should act as a passthrough if truthy", () => {
      expect(nullSafe.object({ key: "value" })).toEqual({ key: "value" });
    });

    it("should return an empty object if falsy", () => {
      expect(nullSafe.object(undefined)).toEqual({});
    });

    it("should return a fallback object if falsy", () => {
      expect(nullSafe.object(undefined, { key: "fallback" })).toEqual({
        key: "fallback",
      });
    });
  });

  describe("checking for number...", () => {
    it("should act as a passthrough if truthy", () => {
      expect(nullSafe.number(42)).toBe(42);
    });

    it("should return 0 if falsy", () => {
      expect(nullSafe.number(undefined)).toBe(0);
    });

    it("should return a fallback number if falsy", () => {
      expect(nullSafe.number(undefined, 99)).toBe(99);
    });
  });
});
