import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Screen } from '@/components';
import { isValidTokenFormat } from '@/lib/tokenFormat';
import { colors } from '@/shared/theme';
import { useToken, useTokenSubmit } from '@/packages/Auth/hooks';
import { styles } from './TokenScreen.styles';

export function TokenScreen() {
  const { rejected } = useToken();
  const { submit, verifying, error } = useTokenSubmit();
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
        {rejected && !error ? (
          <Text style={styles.error}>Your token was rejected or has expired. Enter a new one.</Text>
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          editable={!verifying}
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={verifying ? 'Checking…' : 'Continue'}
          onPress={() => submit(trimmed)}
          disabled={!trimmed || invalidFormat}
          loading={verifying}
        />
      </View>
    </Screen>
  );
}
