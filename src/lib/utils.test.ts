import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merge class names", () => expect(cn("foo", "bar")).toBe("foo bar"));
  it("conditional classes", () => {
    const shouldShow = false;
    expect(cn("foo", shouldShow && "bar", "baz")).toBe("foo baz");
  });
});