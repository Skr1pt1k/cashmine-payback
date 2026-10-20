import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, EmptyView, ErrorView, LoadingView, Screen } from '@/components';
import { formatUsd } from '@/shared/money';
import { formatAge } from '@/shared/utils';
import { useToken } from '@/packages/Auth';
import { AssetCard } from '@/packages/Balances/components';
import { STALE_AFTER_MS } from '@/packages/Balances/constants';
import { useBalances, useNow } from '@/packages/Balances/hooks';
import { summarizeBalances } from '@/packages/Balances/utils';
import { styles } from './BalancesScreen.styles';

export function BalancesScreen() {
  const router = useRouter();
  const { clearToken } = useToken();
  const now = useNow();
  const { data, error, isPending, isFetching, refetch } = useBalances();

  const header = (
    <View style={styles.topBar}>
      <Text style={styles.brand}>CashMine</Text>
      <View style={styles.topActions}>
        <Button title="Activity" variant="ghost" onPress={() => router.push('/activity')} />
        <Button title="Change token" variant="ghost" onPress={clearToken} />
      </View>
    </View>
  );

  if (isPending) {
    return (
      <Screen>
        {header}
        <LoadingView label="Loading balances…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        {header}
        <ErrorView
          title="Couldn’t load balances"
          message={error?.message ?? 'Unknown error'}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </Screen>
    );
  }

  const summary = summarizeBalances(data.items);
  const ageMs = now - new Date(data.asOf).getTime();
  const isStale = ageMs > STALE_AFTER_MS;

  return (
    <Screen>
      {header}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total payback</Text>
        <Text style={styles.heroValue}>{formatUsd(summary.totalUsdCents)}</Text>
        <Text style={styles.heroSub}>{formatUsd(summary.availableUsdCents)} available to claim</Text>
      </View>

      <View style={styles.freshRow}>
        <Text style={isStale ? styles.stale : styles.fresh}>
          {isStale ? '⚠ ' : ''}Updated {formatAge(data.asOf, now)}
        </Text>
        <Button title={isFetching ? 'Refreshing…' : 'Refresh'} variant="ghost" onPress={() => refetch()} />
      </View>

      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Couldn’t refresh: {error.message}. Showing the last known balances.
          </Text>
        </View>
      ) : null}

      {data.items.length === 0 ? (
        <EmptyView title="No payback yet" message="Trade on a connected exchange to start earning payback." />
      ) : (
        <View style={styles.list}>
          {data.items.map((balance) => (
            <AssetCard
              key={balance.asset}
              balance={balance}
              onClaim={() => router.push({ pathname: '/claim/[asset]', params: { asset: balance.asset } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
