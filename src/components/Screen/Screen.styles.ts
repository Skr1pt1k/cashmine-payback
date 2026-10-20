import { StyleSheet } from 'react-native';
import { colors, MAX_CONTENT_WIDTH, spacing } from '@/shared/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
});
