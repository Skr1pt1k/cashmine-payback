import { Pressable, Text, View } from 'react-native';
import type { ActivityItem } from '@/shared/types';
import { formatDateTime } from '@/shared/utils';
import { TYPE_LABEL } from '@/packages/Activity/constants';
import { styles } from './ActivityRow.styles';

type Props = { item: ActivityItem; onPress?: () => void };

export function ActivityRow({ item, onPress }: Props) {
  const negative = item.amount.startsWith('-');
  const statusStyle =
    item.status === 'pending' ? styles.statusPending : item.status === 'failed' ? styles.statusFailed : styles.statusDone;
  const subtitle = [item.exchange, formatDateTime(item.createdAt)].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <Text style={styles.title}>
          {TYPE_LABEL[item.type]} {onPress ? '›' : ''}
        </Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, negative ? styles.negative : styles.positive]} selectable>
          {negative ? '' : '+'}
          {item.amount} {item.asset}
        </Text>
        <Text style={[styles.status, statusStyle]}>{item.status}</Text>
      </View>
    </Pressable>
  );
}
