import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/shared/theme';
import { styles } from './StateViews.styles';

export function LoadingView({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} size="large" />
      {label ? <Text style={styles.message}>{label}</Text> : null}
    </View>
  );
}

type ErrorProps = { title?: string; message: string; onRetry?: () => void; retrying?: boolean };

export function ErrorView({ title = 'Something went wrong', message, onRetry, retrying }: ErrorProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} loading={retrying} /> : null}
    </View>
  );
}

export function EmptyView({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}
