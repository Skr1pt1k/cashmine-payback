import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Screen } from '@/components';
import { colors } from '@/shared/theme';
import { useToken } from '@/packages/Auth/hooks';
import { styles } from './TokenScreen.styles';

export function TokenScreen() {
  const { setToken, rejected } = useToken();
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>CashMine</Text>
        <Text style={styles.subtitle}>
          Paste your API token to see your payback. It is stored only in this browser.
        </Text>
        {rejected ? <Text style={styles.error}>Your token was rejected or has expired. Enter a new one.</Text> : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="ct1.…"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          accessibilityLabel="API token"
        />
        <Button title="Continue" onPress={() => setToken(trimmed)} disabled={!trimmed} />
      </View>
    </Screen>
  );
}
