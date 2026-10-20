import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, EmptyView, ErrorView, LoadingView, Screen } from '@/components';
import { localClaimsStore } from '@/shared/localClaims';
import { CLAIM_ERROR_TEXT, canClaim, maxClaimAmount, quoteClaim } from '@/shared/money';
import { queryKeys } from '@/shared/query';
import { colors } from '@/shared/theme';
import type { Claim } from '@/shared/types';
import { useBalances } from '@/packages/Balances';
import { DestinationPicker, SummaryRow } from '@/packages/Claim/components';
import { useClaimOptions, useSubmitClaim } from '@/packages/Claim/hooks';
import { styles } from './ClaimScreen.styles';

const UNKNOWN_REASON: Partial<Record<string, string>> = {
  TIMEOUT: 'The server didn’t answer in time.',
  NETWORK: 'The connection dropped before we got an answer.',
  SERVER: 'The server had a temporary problem.',
  RATE_LIMITED: 'The server is busy right now.',
};

export function ClaimScreen({ asset }: { asset: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const balances = useBalances();
  const options = useClaimOptions(asset);

  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'review'>('form');

  const onCreated = useCallback(
    (claim: Claim) => {
      // Show the claim in the balance right away, until a snapshot includes it.
      localClaimsStore.add({ id: claim.id, asset: claim.asset, amount: claim.amount, createdAt: claim.createdAt });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      router.replace({ pathname: '/claim/status/[id]', params: { id: claim.id } });
    },
    [queryClient, router],
  );
  const { state, submit, retry, reset } = useSubmitClaim(onCreated);

  const balance = balances.data?.items.find((b) => b.asset === asset);
  const rules = useMemo(
    () =>
      balance && options.data
        ? { decimals: balance.decimals, available: balance.available, minAmount: options.data.minAmount, fee: options.data.fee }
        : null,
    [balance, options.data],
  );
  const quote = rules ? quoteClaim(amount, rules) : null;
  const selectedDestination = destinationId ?? options.data?.destinations[0]?.id ?? null;

  const back = <Button title="‹ Back" variant="ghost" onPress={() => router.back()} />;

  // ---- In flight / unknown outcome. Rendered from the body that was actually sent, before any
  // check on the current balance: after a claim goes through, the balance no longer allows the
  // same amount, and that must not hide the "couldn't confirm" state.
  if (state.status === 'unknown' || state.status === 'submitting') {
    const sent = state.body;
    const sentTo = options.data?.destinations.find((d) => d.id === sent.destinationId)?.label ?? sent.destinationId;
    if (state.status === 'submitting') {
      return (
        <Screen>
          <Text style={styles.title}>Confirm claim</Text>
          <View style={styles.card}>
            <SummaryRow label="Amount" value={`${sent.amount} ${sent.asset}`} />
            <SummaryRow label="To" value={sentTo} />
          </View>
          <Button title={state.attempt > 1 ? `Retrying… (${state.attempt})` : 'Submitting…'} onPress={() => {}} loading />
        </Screen>
      );
    }
    return (
      <Screen>
        <Text style={styles.title}>Claim {sent.asset}</Text>
        <View style={styles.warnCard}>
          <Text style={styles.warnTitle}>We couldn’t confirm your claim</Text>
          <Text style={styles.warnText}>
            {UNKNOWN_REASON[state.error.code] ?? 'The server did not give a clear answer.'} Your claim of {sent.amount}{' '}
            {sent.asset} may or may not have been created. Checking again is safe: it can never create a second claim.
          </Text>
          <Button title="Check again" onPress={retry} />
          <Button title="Go to activity" variant="secondary" onPress={() => router.replace('/activity')} />
        </View>
        <View style={styles.card}>
          <SummaryRow label="Amount" value={`${sent.amount} ${sent.asset}`} />
          <SummaryRow label="To" value={sentTo} />
        </View>
      </Screen>
    );
  }

  if (balances.isPending || options.isPending) {
    return (
      <Screen>
        {back}
        <LoadingView label="Loading claim details…" />
      </Screen>
    );
  }

  if (!rules || !balance || !options.data) {
    const error = options.error ?? balances.error;
    return (
      <Screen>
        {back}
        {error ? (
          <ErrorView
            title="Couldn’t load claim details"
            message={error.message}
            onRetry={() => {
              options.refetch();
              balances.refetch();
            }}
          />
        ) : (
          <EmptyView title={`No ${asset} balance`} message="This asset is not in your balances." />
        )}
      </Screen>
    );
  }

  if (!canClaim(rules)) {
    return (
      <Screen>
        {back}
        <Text style={styles.title}>Claim {asset}</Text>
        <EmptyView
          title="Nothing to claim yet"
          message={`You have ${balance.available} ${asset} available. The minimum claim is ${options.data.minAmount} ${asset} and the fee is ${options.data.fee} ${asset}.`}
        />
      </Screen>
    );
  }

  const destinationLabel = options.data.destinations.find((d) => d.id === selectedDestination)?.label ?? '—';
  const showError = touched && quote && !quote.ok;

  // ---- Review & confirm
  if (step === 'review' && quote?.ok && selectedDestination) {
    return (
      <Screen>
        <Text style={styles.title}>Confirm claim</Text>
        <View style={styles.card}>
          <SummaryRow label="Amount" value={`${quote.amount} ${asset}`} />
          <SummaryRow label="Fee" value={`− ${quote.fee} ${asset}`} />
          <SummaryRow label="You receive" value={`${quote.receive} ${asset}`} strong />
          <SummaryRow label="To" value={destinationLabel} />
        </View>
        {state.status === 'rejected' ? <Text style={styles.error}>{state.error.message}</Text> : null}
        <View style={styles.actions}>
          <Button
            title="Confirm claim"
            onPress={() => submit({ asset, amount: quote.amount, destinationId: selectedDestination })}
          />
          <Button
            title="Edit"
            variant="secondary"
            onPress={() => {
              reset();
              setStep('form');
            }}
          />
        </View>
      </Screen>
    );
  }

  // ---- Form
  return (
    <Screen>
      {back}
      <Text style={styles.title}>Claim {asset}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            value={amount}
            onChangeText={(text) => setAmount(text.replace(',', '.'))}
            onBlur={() => setTouched(true)}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            inputMode="decimal"
            autoCorrect={false}
            accessibilityLabel={`Amount in ${asset}`}
          />
          <Button
            title="Max"
            variant="secondary"
            onPress={() => {
              setAmount(maxClaimAmount(rules));
              setTouched(true);
            }}
          />
        </View>
        <Text style={styles.hint}>
          Available {balance.available} {asset} · Min {options.data.minAmount} {asset}
        </Text>
        {showError ? <Text style={styles.error}>{CLAIM_ERROR_TEXT[quote.error]}</Text> : null}
      </View>

      {options.data.destinations.length > 1 ? (
        <View style={styles.section}>
          <Text style={styles.label}>Send to</Text>
          <DestinationPicker
            destinations={options.data.destinations}
            value={selectedDestination}
            onChange={setDestinationId}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <SummaryRow label="Fee" value={`${options.data.fee} ${asset}`} />
        <SummaryRow label="You receive" value={quote?.ok ? `${quote.receive} ${asset}` : '—'} strong />
      </View>

      <Button
        title="Review"
        disabled={!quote?.ok || !selectedDestination}
        onPress={() => {
          setTouched(true);
          if (quote?.ok) setStep('review');
        }}
      />
    </Screen>
  );
}
