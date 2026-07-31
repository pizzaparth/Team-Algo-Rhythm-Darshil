/**
 * mathRenderer.ts — KaTeX helpers for the rich-text editor
 *
 * Math is stored in the document HTML as a single non-editable span:
 *
 *   <span class="math-node" data-latex="x^2" data-display="false"
 *         contenteditable="false">…KaTeX output…</span>
 *
 * Keeping the original source in `data-latex` is what makes math survive a
 * round-trip: the editor persists `innerHTML`, so on reload the rendered
 * markup is already there and the source is still recoverable for editing.
 * `contenteditable="false"` makes the browser treat it as one atomic unit,
 * so arrow keys step over it and backspace removes it whole rather than
 * letting the caret wander into KaTeX's internal markup.
 */

import katex from 'katex';

/** Caret foothold inserted after trailing math nodes (U+200B). */
const ZERO_WIDTH_SPACE = '\u200B';

/** Upper bound on an inline `$\u2026$` span, to contain currency false-positives. */
const MAX_INLINE_MATH_LENGTH = 400;

/** Renders LaTeX to KaTeX HTML. Never throws — invalid input renders in red. */
export function renderMathToHTML(latex: string, display: boolean): string {
  return katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    errorColor: '#e11d48',
    output: 'html',
  });
}

/** Builds the atomic, non-editable span that holds a piece of rendered math. */
export function createMathElement(latex: string, display: boolean): HTMLSpanElement {
  const el = document.createElement('span');
  el.className = display ? 'math-node math-node-display' : 'math-node';
  el.setAttribute('data-latex', latex);
  el.setAttribute('data-display', String(display));
  el.setAttribute('contenteditable', 'false');
  el.innerHTML = renderMathToHTML(latex, display);
  return el;
}

interface MathMatch {
  start: number;
  end: number;
  latex: string;
  display: boolean;
}

/**
 * Detects a math expression the caret has just closed inside a text node.
 *
 * Only fires when the character immediately before the caret is `$`, so it
 * costs nothing on ordinary keystrokes and can't fire while the user is still
 * typing the opening delimiter (there'd be no earlier `$` to match).
 *
 * @param text   the text node's content
 * @param offset the caret offset within that text
 */
export function findClosedMathAtCaret(text: string, offset: number): MathMatch | null {
  if (offset < 2 || text[offset - 1] !== '$') return null;

  // Display math: $$…$$
  if (text[offset - 2] === '$') {
    const closingStart = offset - 2;
    const openIdx = text.lastIndexOf('$$', closingStart - 1);
    if (openIdx === -1) return null;
    const latex = text.slice(openIdx + 2, closingStart);
    if (!latex.trim()) return null;
    return { start: openIdx, end: offset, latex, display: true };
  }

  // Inline math: $…$
  const openIdx = text.lastIndexOf('$', offset - 2);
  if (openIdx === -1) return null;

  // The `$` we found is the tail of a `$$` opener, which means the caret is
  // sitting on the *first* `$` of a closing `$$`. Bail so the display rule can
  // handle it on the next keystroke — otherwise we'd swallow the middle and
  // strand a literal `$` on each side.
  if (openIdx > 0 && text[openIdx - 1] === '$') return null;

  const latex = text.slice(openIdx + 1, offset - 1);
  // A nested `$` means the delimiters don't pair up cleanly — leave it alone.
  if (!latex.trim() || latex.includes('$')) return null;

  // Currency guard: in prose like "under $10k … costs $50" the second `$`
  // would otherwise match the first and turn the sentence between them into
  // math. Real inline math never has whitespace hugging its delimiters, so
  // require them tight, and cap the span so a stray `$` can't eat a paragraph.
  if (/^\s|\s$/.test(latex)) return null;
  if (latex.length > MAX_INLINE_MATH_LENGTH) return null;

  return { start: openIdx, end: offset, latex, display: false };
}

/**
 * Replaces a `$…$` range in a text node with rendered math and leaves the
 * caret after it. Returns false if the selection wasn't usable.
 */
export function replaceRangeWithMath(
  textNode: Text,
  match: MathMatch,
): boolean {
  const selection = window.getSelection();
  if (!selection) return false;

  const range = document.createRange();
  range.setStart(textNode, match.start);
  range.setEnd(textNode, match.end);
  range.deleteContents();

  const mathEl = createMathElement(match.latex, match.display);
  range.insertNode(mathEl);

  placeCaretAfter(mathEl, selection);
  return true;
}

/**
 * Collapses the selection immediately after a node. When the node is the last
 * child there's nowhere for the caret to land, so a zero-width space is added
 * to give it a foothold — otherwise typing would continue *inside* the math.
 */
export function placeCaretAfter(node: Node, selection: Selection): void {
  if (!node.nextSibling) {
    node.parentNode?.insertBefore(document.createTextNode(ZERO_WIDTH_SPACE), node.nextSibling);
  }

  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}
