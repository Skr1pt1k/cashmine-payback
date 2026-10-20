import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '@/shared/theme';
import { styles } from './Button.styles';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, styles[variant], isDisabled && styles.disabled, pressed && styles.pressed]}
    >
      {loading && <ActivityIndicator color={variant === 'primary' ? colors.accentText : colors.text} />}
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </Pressable>
  );
}
