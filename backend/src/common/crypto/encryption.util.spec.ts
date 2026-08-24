import { decryptSecret, encryptSecret, maskSecret } from "./encryption.util";

describe("encryption util", () => {
  it("round-trips a secret", () => {
    const secret = "sk-or-v1-abcdef1234567890";
    const encrypted = encryptSecret(secret);
    expect(encrypted).not.toContain(secret);
    expect(decryptSecret(encrypted)).toBe(secret);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });

  it("detects tampering", () => {
    const encrypted = encryptSecret("secret-value");
    const [iv, tag, data] = encrypted.split(":");
    const tampered = [iv, tag, Buffer.from("tampered-data").toString("base64")].join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});

describe("maskSecret", () => {
  it("never returns the full key", () => {
    const key = "sk-or-v1-fakekey00000000000000000000000000000000000000000000000000000099aa";
    const masked = maskSecret(key);
    expect(masked).not.toBe(key);
    expect(masked).not.toContain("fakekey000000000000000000000000000000000000000000000000000000");
    expect(masked).toContain(key.slice(-4));
  });
});
