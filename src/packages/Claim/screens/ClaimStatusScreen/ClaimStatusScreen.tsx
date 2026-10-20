import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ErrorView, LoadingView, Screen } from '@/components';
import { colors } from '@/shared/theme';
import { formatDateTime } from '@/shared/utils';
import { SummaryRow } from '@/packages/Claim/components';
import { useClaim } from '@/packages/Claim/hooks';
import { styles } from './ClaimStatusScreen.styles';

const STATUS_COPY = {
  pending: { title: 'Claim in progress', message: 'This usually takes up to 20 seconds. You can leave this screen.' },
  completed: { title: 'Claim completed', message: 'The funds have been sent.' },
  failed: { title: 'Claim failed', message: 'The amount has been returned to your available balance.' },
} as const;

export function ClaimStatusScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: claim, error, isPending, refetch, isFetching } = useClaim(id);
  const home = <Button title="Back to balances" variant="secondary" onPress={() => router.replace('/')} />;

  if (isPending) {
    return (
      <Screen>
        <LoadingView label="Loading claim…" />
      </Screen>
    );
  }

  if (!claim) {
    return (
      <Screen>
        <ErrorView title="Couldn’t load claim" message={error?.message ?? ''} onRetry={() => refetch()} retrying={isFetching} />
        {home}
      </Screen>
    );
  }

  const copy = STATUS_COPY[claim.status];

  return (
    <Screen>
      <View style={styles.statusBox}>
        {claim.status === 'pending' ? (
          <ActivityIndicator size="large" color={colors.warning} />
        ) : (
          <Text style={styles.icon}>{claim.status === 'completed' ? '✅' : '❌'}</Text>
        )}
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.message}>{copy.message}</Text>
        {claim.failureReason ? <Text style={styles.failure}>{claim.failureReason}</Text> : null}
      </View>

      <View style={styles.card}>
        <SummaryRow label="Amount" value={`${claim.amount} ${claim.asset}`} />
        <SummaryRow label="Fee" value={`− ${claim.fee} ${claim.asset}`} />
        <SummaryRow label="You receive" value={`${claim.receiveAmount} ${claim.asset}`} strong />
        <SummaryRow label="Created" value={formatDateTime(claim.createdAt)} />
        <SummaryRow label="Claim ID" value={claim.id} />
      </View>

      {error ? <Text style={styles.hint}>Couldn’t refresh status, retrying…</Text> : null}
      {home}
    </Screen>
  );
}
