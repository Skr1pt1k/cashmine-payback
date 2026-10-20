import { useLocalSearchParams } from 'expo-router';
import { ClaimStatusScreen } from '@/packages/Claim';

export default function ClaimStatusRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClaimStatusScreen id={id} />;
}
