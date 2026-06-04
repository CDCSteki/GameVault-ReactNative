import { useRouter } from 'expo-router';
import { SearchScreen } from '../../components/screens/SearchScreen';

export default function SearchTab() {
  const router = useRouter();

  return (
    <SearchScreen
      onGameClick={(gameId) => router.push(`/game/${gameId}`)}
    />
  );
}