import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  option: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selected: { borderColor: colors.accent },
  text: { color: colors.text, fontSize: 15 },
});
