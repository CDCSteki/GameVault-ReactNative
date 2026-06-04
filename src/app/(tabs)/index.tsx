import { useRouter } from 'expo-router';
import { HomeScreen } from '../../components/screens/HomeScreen';

export default function HomeTab() {
  const router = useRouter();

  return (
    <HomeScreen
      onGameClick={(gameId) => router.push(`/game/${gameId}`)}
      onViewAllClick={(listType) => router.push(`/game/list/${listType}`)}
    />
  );
}