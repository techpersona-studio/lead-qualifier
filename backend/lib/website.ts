// Fetches a lead's website and extracts readable text so the model can see what
// the business actually does, instead of guessing from form fields alone.

const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 6000; // keep the prompt small; the first chunk holds the useful signal

// Strips scripts, styles, and tags down to visible text. Good enough to tell a
// pho restaurant from a SaaS company without pulling in a full HTML parser.
function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function pullTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? htmlToText(match[1]) : "";
}

function pullMetaDescription(html: string): string {
  const match = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  return match ? htmlToText(match[1]) : "";
}

export interface WebsiteContext {
  ok: boolean;
  text: string; // formatted block ready to drop into the prompt, or an error note
}

export async function fetchWebsiteContext(url?: string): Promise<WebsiteContext> {
  if (!url) {
    return { ok: false, text: "" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Some hosts return a blank page to unknown agents; present a real browser UA.
        "User-Agent":
          "Mozilla/5.0 (compatible; LeadQualifierBot/1.0; +https://trigger.dev)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return { ok: false, text: `Website fetch failed (HTTP ${response.status}).` };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      return { ok: false, text: `Website returned non-HTML content (${contentType}).` };
    }

    const html = await response.text();
    const title = pullTitle(html);
    const description = pullMetaDescription(html);
    const body = htmlToText(html).slice(0, MAX_TEXT_LENGTH);

    const parts = [
      title && `Page title: ${title}`,
      description && `Meta description: ${description}`,
      body && `Page content: ${body}`,
    ].filter(Boolean);

    if (parts.length === 0) {
      return { ok: false, text: "Website loaded but no readable text was found." };
    }

    return { ok: true, text: parts.join("\n") };
  } catch (err) {
    const reason = err instanceof Error && err.name === "AbortError"
      ? "timed out"
      : "could not be reached";
    return { ok: false, text: `Website ${reason}.` };
  } finally {
    clearTimeout(timer);
  }
}
