import { Pressable, Text, View } from 'react-native';
import type { Destination } from '@/shared/types';
import { styles } from './DestinationPicker.styles';

type Props = { destinations: Destination[]; value: string | null; onChange: (id: string) => void };

export function DestinationPicker({ destinations, value, onChange }: Props) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {destinations.map((d) => (
        <Pressable
          key={d.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === d.id }}
          onPress={() => onChange(d.id)}
          style={[styles.option, value === d.id && styles.selected]}
        >
          <Text style={styles.text}>{d.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
