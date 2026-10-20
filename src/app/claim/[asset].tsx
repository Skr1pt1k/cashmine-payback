import { useLocalSearchParams } from 'expo-router';
import { ClaimScreen } from '@/packages/Claim';

export default function ClaimRoute() {
  const { asset } = useLocalSearchParams<{ asset: string }>();
  return <ClaimScreen asset={asset} />;
}
