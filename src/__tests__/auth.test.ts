import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
} from "../utils/auth";

describe("Authentication Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for same password", async () => {
      const password = "testpassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await comparePassword("wrongpassword", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate a JWT token", () => {
      const publisherId = "test-publisher-id";
      const token = generateToken(publisherId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const publisherId = "test-publisher-id";
      const token = generateToken(publisherId);
      const decoded = verifyToken(token);

      expect(decoded.publisherId).toBe(publisherId);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow();
    });
  });

  describe("extractToken", () => {
    it("should extract token from Bearer header", () => {
      const token = "test-token-123";
      const authHeader = `Bearer ${token}`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBe(token);
    });

    it("should return null for missing header", () => {
      expect(extractToken(undefined)).toBeNull();
    });

    it("should return null for invalid format", () => {
      expect(extractToken("InvalidFormat token")).toBeNull();
    });
  });
});
