import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: colors.text, fontSize: 20, fontWeight: '700' },
  topActions: { flexDirection: 'row' },
  hero: { gap: spacing.xs, paddingVertical: spacing.sm },
  heroLabel: { color: colors.textSecondary, fontSize: 14 },
  heroValue: { color: colors.text, fontSize: 36, fontWeight: '700', fontVariant: ['tabular-nums'] },
  heroSub: { color: colors.textSecondary, fontSize: 14 },
  freshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  fresh: { color: colors.textTertiary, fontSize: 13 },
  stale: { color: colors.warning, fontSize: 13, flex: 1 },
  banner: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.md,
  },
  bannerText: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  list: { gap: spacing.md },
});
