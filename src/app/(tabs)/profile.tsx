import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../components/screens/ProfileScreen';

export default function ProfileTab() {
  const router = useRouter();

  return (
    <ProfileScreen
      onLogout={() => router.replace('/auth/login')}
    />
  );
}