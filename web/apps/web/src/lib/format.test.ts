import { describe, expect, test } from "bun:test";

import {
  formatDurationMinutes,
  getDurationMinutes,
  getElapsedMinutes,
  parseApiDateTime,
} from "./format";

describe("parseApiDateTime", () => {
  test("keeps the local wall-clock time instead of shifting through UTC", () => {
    const date = parseApiDateTime("2026-11-20T14:30:00Z");
    expect(date?.getHours()).toBe(14);
    expect(date?.getMinutes()).toBe(30);
  });

  test("returns null for empty or invalid values", () => {
    expect(parseApiDateTime(undefined)).toBeNull();
    expect(parseApiDateTime("")).toBeNull();
    expect(parseApiDateTime("not-a-date")).toBeNull();
  });
});

describe("durations", () => {
  test("computes minutes between two API timestamps", () => {
    expect(getDurationMinutes("2026-11-20T10:00:00", "2026-11-20T11:30:00")).toBe(90);
  });

  test("returns null when the end is before the start", () => {
    expect(getDurationMinutes("2026-11-20T12:00:00", "2026-11-20T11:00:00")).toBeNull();
  });

  test("computes elapsed minutes from an injected clock", () => {
    const now = new Date("2026-11-20T12:00:00");
    expect(getElapsedMinutes("2026-11-20T10:15:00", now)).toBe(105);
  });

  test("formats minutes as hours and minutes", () => {
    expect(formatDurationMinutes(0)).toBe("0min");
    expect(formatDurationMinutes(45)).toBe("45min");
    expect(formatDurationMinutes(60)).toBe("1h");
    expect(formatDurationMinutes(90)).toBe("1h 30min");
  });
});
