import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Screen } from '@/components';
import { isValidTokenFormat } from '@/lib/tokenFormat';
import { colors } from '@/shared/theme';
import { useToken } from '@/packages/Auth/hooks';
import { styles } from './TokenScreen.styles';

export function TokenScreen() {
  const { setToken, rejected } = useToken();
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const invalidFormat = trimmed.length > 0 && !isValidTokenFormat(trimmed);

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
          spellCheck={false}
          multiline
          accessibilityLabel="API token"
        />
        {invalidFormat ? (
          <Text style={styles.error}>The token can only contain Latin letters, digits and symbols, with no spaces.</Text>
        ) : null}
        <Button title="Continue" onPress={() => setToken(trimmed)} disabled={!trimmed || invalidFormat} />
      </View>
    </Screen>
  );
}
