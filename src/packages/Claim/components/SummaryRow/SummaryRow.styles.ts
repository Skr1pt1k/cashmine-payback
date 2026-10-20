import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontVariant: ['tabular-nums'], textAlign: 'right', flexShrink: 1 },
  strong: { fontSize: 17, fontWeight: '700', color: colors.accent },
});
