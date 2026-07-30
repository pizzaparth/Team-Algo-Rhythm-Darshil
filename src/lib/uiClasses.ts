/**
 * uiClasses.ts — Shared Tailwind class-string helpers
 *
 * Small utilities that fix the color tokens for a repeated button
 * style while leaving layout (padding, radius, gap, shadow) to the
 * call site, which appends its own classes via the `extra` param.
 */

/** App-shell primary button: near-black bg, white text. */
export function primaryButtonClasses(extra = ''): string {
  return `bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white transition-colors ${extra}`.trim();
}
