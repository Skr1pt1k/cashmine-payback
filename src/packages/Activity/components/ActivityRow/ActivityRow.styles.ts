import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  left: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 2, flexShrink: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sub: { color: colors.textTertiary, fontSize: 12 },
  amount: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  positive: { color: colors.accent },
  negative: { color: colors.text },
  status: { fontSize: 12, textTransform: 'capitalize' },
  statusPending: { color: colors.warning },
  statusFailed: { color: colors.destructive },
  statusDone: { color: colors.textTertiary },
});
