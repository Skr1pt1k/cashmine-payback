import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  asset: { color: colors.text, fontSize: 18, fontWeight: '700' },
  usd: { color: colors.textSecondary, fontSize: 14 },
  label: { color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  available: { color: colors.text, fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  metaValue: { color: colors.textSecondary, fontSize: 14, fontVariant: ['tabular-nums'] },
  claimingValue: { color: colors.warning, fontSize: 14, fontVariant: ['tabular-nums'] },
  col: { flex: 1, gap: 2 },
  claimingHint: { color: colors.warning, fontSize: 11 },
  actions: { gap: spacing.xs },
});
