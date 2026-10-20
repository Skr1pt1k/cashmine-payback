import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', minHeight: 36, paddingHorizontal: spacing.sm },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: colors.accentText },
  secondaryText: { color: colors.text },
  ghostText: { color: colors.info, fontSize: 14 },
});
