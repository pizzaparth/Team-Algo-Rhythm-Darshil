/**
 * markdownRenderer.ts — Shared lightweight markdown renderer.
 *
 * Converts markdown to HTML without external dependencies.
 * Used by both ChatInterface and ConversationThread.
 *
 * Supports:
 * - ### ## # headings
 * - **bold** *italic* ~~strikethrough~~ `inline code`
 * - > blockquotes
 * - - and * unordered lists
 * - 1. 2. ordered lists
 * - --- horizontal rules
 * - [text](url) links
 * - Paragraph breaks (double newline)
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML special chars first (prevent XSS)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Horizontal rule
    .replace(/^---+$/gm, '<hr class="border-t border-[#E5E2DD] my-2" />')

    // Headings
    .replace(/^### (.+)$/gm, '<h4 class="text-xs font-bold text-[#1A1A1A] mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-bold text-[#1A1A1A] mt-3 mb-1">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-base font-bold text-[#1A1A1A] mt-3 mb-1">$1</h2>')

    // Bold + Italic combined
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold italic text-[#1A1A1A]">$1</strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1A1A1A]">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-[#555]">$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del class="line-through opacity-60">$1</del>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#EEEBE6] rounded text-[10px] font-mono text-[#1A1A1A]">$1</code>')

    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote class="pl-3 border-l-2 border-indigo-400 text-[#666] italic text-[11px] my-1 bg-indigo-50/30 py-0.5 rounded-r">$1</blockquote>')

    // Unordered lists — wrap consecutive items later
    .replace(/^[\*\-] (.+)$/gm, '<li class="ml-4 list-disc text-[11px] leading-relaxed my-0.5">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[11px] leading-relaxed my-0.5">$1</li>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 underline hover:text-indigo-800" target="_blank" rel="noopener noreferrer">$1</a>')

    // Paragraph breaks
    .replace(/\n\n/g, '</p><p class="my-1.5">')

    // Single line breaks
    .replace(/\n/g, '<br/>');

  // Wrap in paragraph if not already a block element
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote') && !html.startsWith('<hr')) {
    html = `<p class="my-0.5">${html}</p>`;
  }

  return html;
}

/**
 * Get relative timestamp from ISO string or plain text.
 */
export function getRelativeTime(ts: string): string {
  if (!ts) return 'Unknown';
  // Handle legacy plain-text timestamps like "10 mins ago", "Yesterday", "Just now"
  if (!ts.includes('T') && !ts.includes('-') || ts === 'Just now' || ts.endsWith('ago') || ts === 'Yesterday') {
    return ts;
  }
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(ts).toLocaleDateString();
  } catch {
    return ts;
  }
}
