import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { LoginScreen } from '../../components/screens/LoginScreen';
import { useLoginStore } from '../../store/useAuthStore';

export default function LoginRoute() {
  const router = useRouter();
  const { resetLogin } = useLoginStore();

  // Reset form every time we land on login
  useEffect(() => { resetLogin(); }, []);

  return (
    <LoginScreen
      onLoginSuccess={() => router.replace('/(tabs)')}
      onNavigateToRegister={() => router.push('/auth/register')}
    />
  );
}