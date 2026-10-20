import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.md,
    // 16px+ stops iOS Safari from zooming the page on focus.
    fontSize: 16,
    minHeight: 96,
    fontFamily: 'monospace',
  },
  error: { color: colors.destructive, fontSize: 14 },
});
