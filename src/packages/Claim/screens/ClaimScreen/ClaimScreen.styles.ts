import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  section: { gap: spacing.sm },
  label: { color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 20,
    minHeight: 52,
    fontVariant: ['tabular-nums'],
  },
  inputError: { borderColor: colors.destructive },
  hint: { color: colors.textTertiary, fontSize: 13 },
  error: { color: colors.destructive, fontSize: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  warnCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.lg,
    gap: spacing.md,
  },
  warnTitle: { color: colors.warning, fontSize: 16, fontWeight: '600' },
  warnText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  actions: { gap: spacing.sm },
});
