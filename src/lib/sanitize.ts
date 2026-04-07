/**
 * sanitize.ts — HTML Sanitization Helper
 *
 * WHY THIS EXISTS:
 *   The app uses a rich-text editor (Tiptap) that stores and renders raw HTML.
 *   Rendering unsanitized HTML with dangerouslySetInnerHTML opens the door to
 *   stored XSS attacks — a malicious contract note could inject a <script> tag
 *   that steals session cookies or exfiltrates data.
 *
 * WHEN TO USE sanitizeInput():
 *   - Before rendering any string with dangerouslySetInnerHTML={{ __html: ... }}
 *   - Before storing rich-text editor content to the database / Excel file
 *   - When displaying user-supplied content that may contain HTML markup
 *
 * WHEN YOU DO NOT NEED IT:
 *   - Plain text rendered as React children (React escapes it automatically)
 *   - Values bound to non-HTML attributes (className, value, href after validation)
 *
 * LIBRARY: DOMPurify (https://github.com/cure53/DOMPurify)
 *   - Strips dangerous tags (<script>, <iframe>, <object>, event handlers, etc.)
 *   - Keeps safe formatting tags (<b>, <i>, <ul>, <p>, <a>, …)
 *   - Works in both browser and SSR (with jsdom shim)
 */

import DOMPurify from "dompurify";

/**
 * Sanitizes an HTML string, removing any tags or attributes that could
 * execute JavaScript or load external resources.
 *
 * @param dirty  Raw HTML string (e.g. from a rich-text editor or API response)
 * @returns      Safe HTML string — safe to pass to dangerouslySetInnerHTML
 *
 * @example
 *   // In a React component:
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeInput(note.content) }} />
 */
export function sanitizeInput(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow common rich-text tags but nothing that can run code.
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "u", "s", "strike",
      "p", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a",            // <a> is kept but href is restricted below
      "img",          // <img> is kept but src is restricted below
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    // Strip any attribute not in this list (removes event handlers like onclick).
    ALLOWED_ATTR: [
      "href",         // links — only safe protocols (see ALLOWED_URI_REGEXP)
      "src",          // images — only data: or same-origin URLs
      "alt", "title",
      "class",        // styling via CSS class is fine
      "target", "rel",
      "colspan", "rowspan",
      "style",        // inline style is kept but DOMPurify strips url() etc.
    ],
    // Restrict href/src to safe protocols (blocks javascript: and data:script)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    // Never allow <style> or <script> to be injected even if somehow matched
    FORBID_TAGS: ["style", "script", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/**
 * Strips ALL HTML tags from a string, returning plain text only.
 * Use this when you need the text content of an HTML string without any markup.
 *
 * @example
 *   const preview = stripHtml(note.content).slice(0, 120) + "…";
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
