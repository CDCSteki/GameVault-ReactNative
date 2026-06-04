import { useRouter } from 'expo-router';
import { LibraryScreen } from '../../components/screens/LibraryScreen';

export default function LibraryTab() {
  const router = useRouter();

  return (
    <LibraryScreen
      onGameClick={(gameId) => router.push(`/game/${gameId}`)}
    />
  );
}