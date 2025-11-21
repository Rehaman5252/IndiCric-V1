// app/lib/logger.test.ts
// ✅ FIXED: Correct import path
import { logger } from "../logger";

describe("Logger Event Validation", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
      configurable: true
    });
  });

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs a valid quiz_start event using the generic log method", () => {
    const payload = { format: "T20", brand: "TestBrand", source: "ai" as const };
    logger.event("quiz_start", payload);
    expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("[EVENT] quiz_start"), 
        payload
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("logs a validation error for an invalid quiz_start event", () => {
    const badPayload = { format: "T20" } as any;
    logger.event("quiz_start", badPayload);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[EVENT VALIDATION FAILED] for event "quiz_start":'),
      expect.any(Object)
    );
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("logs a valid quiz_complete event", () => {
    const payload = {
      format: "T20",
      brand: "TestBrand",
      source: "ai" as const,
      score: 4,
      totalQuestions: 5,
      disqualified: false,
      reason: null,
    };
    logger.event("quiz_complete", payload);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[EVENT] quiz_complete"), payload);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("logs a validation error for an invalid quiz_complete event", () => {
    const badPayload = {
      format: "T20",
      brand: "TestBrand",
      source: "ai",
      score: "five",
      totalQuestions: 5,
      disqualified: false,
      reason: null,
    } as any;
    logger.event("quiz_complete", badPayload);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[EVENT VALIDATION FAILED] for event "quiz_complete":'),
      expect.any(Object)
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
});
