import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, extractVisibleText } from "./htmlText.js";

describe("decodeHtmlEntities", () => {
  it("decodes common named, decimal, and hexadecimal entities", () => {
    expect(decodeHtmlEntities("A&amp;B &#8217; &#x2013; &ldquo;ok&rdquo;")).toBe("A&B ’ – “ok”");
  });
});

describe("extractVisibleText", () => {
  it("removes scripts, styles, tags, and normalizes whitespace", () => {
    const text = extractVisibleText("<style>x</style><h1>Make&nbsp;History</h1><script>ignore()</script><p>A&amp;B</p>");

    expect(text).toBe("Make History A&B");
  });
});
