import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, EmptyView, ErrorView, LoadingView, Screen } from '@/components';
import { ActivityRow } from '@/packages/Activity/components';
import { useActivity } from '@/packages/Activity/hooks';
import { styles } from './ActivityScreen.styles';

export function ActivityScreen() {
  const router = useRouter();
  const { data, error, isPending, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isFetchNextPageError } =
    useActivity();

  const header = (
    <View style={styles.topBar}>
      <Button title="‹ Balances" variant="ghost" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Button title={isFetching && !isFetchingNextPage ? 'Refreshing…' : 'Refresh'} variant="ghost" onPress={() => refetch()} />
    </View>
  );

  if (isPending) {
    return (
      <Screen>
        {header}
        <Text style={styles.title}>Activity</Text>
        <LoadingView label="Loading activity…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        {header}
        <Text style={styles.title}>Activity</Text>
        <ErrorView title="Couldn’t load activity" message={error?.message ?? ''} onRetry={() => refetch()} retrying={isFetching} />
      </Screen>
    );
  }

  // Dedupe by id: pages are cursor-based but new items can arrive while paging.
  const seen = new Set<string>();
  const items = data.pages.flatMap((p) => p.items).filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));

  return (
    <Screen>
      {header}
      <Text style={styles.title}>Activity</Text>
      {items.length === 0 ? (
        <EmptyView title="No activity yet" message="Payback and claims will show up here." />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ActivityRow
              key={item.id}
              item={item}
              onPress={
                item.type === 'claim' && item.relatedId
                  ? () => router.push({ pathname: '/claim/status/[id]', params: { id: item.relatedId! } })
                  : undefined
              }
            />
          ))}
        </View>
      )}
      {isFetchNextPageError ? <Text style={styles.error}>Couldn’t load more: {error?.message}</Text> : null}
      {hasNextPage ? (
        <Button
          title={isFetchNextPageError ? 'Try again' : 'Load more'}
          variant="secondary"
          onPress={() => fetchNextPage()}
          loading={isFetchingNextPage}
        />
      ) : items.length > 0 ? (
        <Text style={styles.end}>That’s everything</Text>
      ) : null}
    </Screen>
  );
}
