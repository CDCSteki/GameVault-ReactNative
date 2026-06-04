import { useRouter } from 'expo-router';
import { SettingsScreen } from '../../components/screens/SettingsScreen';

export default function SettingsTab() {
  const router = useRouter();

  return (
    <SettingsScreen
      onAccountDeleted={() => router.replace('/auth/login')}
    />
  );
}