import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/queryClient';
import { TokenProvider, TokenScreen, useToken } from '@/packages/Auth';
import { colors } from '@/shared/theme';

function RootNavigator() {
  const { token } = useToken();
  if (!token) return <TokenScreen />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TokenProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </TokenProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
