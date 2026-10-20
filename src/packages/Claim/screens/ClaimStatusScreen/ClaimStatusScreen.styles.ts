import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  statusBox: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  icon: { fontSize: 48 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  failure: { color: colors.destructive, fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  hint: { color: colors.textTertiary, fontSize: 12, textAlign: 'center' },
});
