import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameListScreen } from '../../../components/screens/GameListScreen';

export default function GameListRoute() {
  const { listType } = useLocalSearchParams<{ listType: string }>();
  const router = useRouter();

  return (
    <GameListScreen
      listType={listType ?? 'popular'}
      onGameClick={(gameId) => router.push(`/game/${gameId}`)}
      onBackClick={() => router.back()}
    />
  );
}