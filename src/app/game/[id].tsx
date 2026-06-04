import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameDetailScreen } from '../../components/screens/GameDetailScreen';

export default function GameDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const gameId = parseInt(id ?? '0', 10);
  if (!gameId) return null;

  return (
    <GameDetailScreen
      gameId={gameId}
      onBackClick={() => router.back()}
    />
  );
}