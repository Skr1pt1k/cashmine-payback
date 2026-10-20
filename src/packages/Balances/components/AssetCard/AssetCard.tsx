import { Text, View } from 'react-native';
import { Button } from '@/components';
import { formatUsd, toUnits, usdCents } from '@/shared/money';
import type { Balance } from '@/shared/types';
import { styles } from './AssetCard.styles';

type Props = { balance: Balance; onClaim: () => void; onViewClaim?: () => void };

export function AssetCard({ balance, onClaim, onViewClaim }: Props) {
  const { asset, decimals, available, pending, claiming, usdPrice } = balance;
  const availableUsd = formatUsd(usdCents(toUnits(available, decimals), decimals, usdPrice));
  const hasClaiming = toUnits(claiming, decimals) > 0n;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.asset}>{asset}</Text>
        <Text style={styles.usd}>≈ {availableUsd}</Text>
      </View>
      <View style={styles.col}>
        <Text style={styles.label}>Available</Text>
        <Text style={styles.available} selectable>
          {available} {asset}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Pending</Text>
          <Text style={styles.metaValue}>{pending}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Claiming</Text>
          <Text style={hasClaiming ? styles.claimingValue : styles.metaValue}>{claiming}</Text>
          {hasClaiming ? <Text style={styles.claimingHint}>in progress</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        {onViewClaim ? <Button title="View claim" variant="ghost" onPress={onViewClaim} /> : null}
        <Button title={`Claim ${asset}`} variant="secondary" onPress={onClaim} />
      </View>
    </View>
  );
}
