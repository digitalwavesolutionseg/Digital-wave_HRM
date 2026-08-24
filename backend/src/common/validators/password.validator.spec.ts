import { validatePasswordPolicy } from "./password.validator";

describe("validatePasswordPolicy", () => {
  it("rejects passwords shorter than 10 characters", () => {
    expect(validatePasswordPolicy("Ab1!x")).toContain("at least 10");
  });

  it("rejects passwords without an uppercase letter", () => {
    expect(validatePasswordPolicy("abcdef1234!")).toContain("uppercase");
  });

  it("rejects passwords without a lowercase letter", () => {
    expect(validatePasswordPolicy("ABCDEF1234!")).toContain("lowercase");
  });

  it("rejects passwords without a digit", () => {
    expect(validatePasswordPolicy("Abcdefghij!")).toContain("digit");
  });

  it("rejects passwords without a special character", () => {
    expect(validatePasswordPolicy("Abcdefg123")).toContain("special");
  });

  it("rejects empty and non-string input", () => {
    expect(validatePasswordPolicy("")).toContain("at least 10");
    expect(validatePasswordPolicy(undefined as unknown as string)).toContain("at least 10");
  });

  it("accepts a password meeting all requirements", () => {
    expect(validatePasswordPolicy("S3curePass!")).toBeNull();
  });
});
