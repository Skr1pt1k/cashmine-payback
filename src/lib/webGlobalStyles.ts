import { Platform } from 'react-native';
import { colors } from '@/shared/theme';

/**
 * Page-level CSS the RN styles can't reach: dark page background (no white edges on overscroll),
 * no horizontal scrolling/bounce, and long unbroken strings (tokens, 18-decimal amounts) wrap.
 */
export function applyWebGlobalStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('cashmine-global')) return;
  const style = document.createElement('style');
  style.id = 'cashmine-global';
  style.textContent = `
    html, body, #root { background-color: ${colors.background}; }
    html, body { overflow-x: hidden; overscroll-behavior: none; max-width: 100%; }
    body { touch-action: pan-y; overflow-wrap: anywhere; }
    textarea, input { overflow-wrap: anywhere; word-break: break-all; }
  `;
  document.head.appendChild(style);
}
