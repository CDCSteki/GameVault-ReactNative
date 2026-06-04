import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { RegisterScreen } from '../../components/screens/RegisterScreen';
import { useRegisterStore } from '../../store/useAuthStore';

export default function RegisterRoute() {
  const router = useRouter();
  const { resetRegister } = useRegisterStore();

  useEffect(() => { resetRegister(); }, []);

  return (
    <RegisterScreen
      onRegisterSuccess={() => router.replace('/(tabs)')}
      onNavigateToLogin={() => router.back()}
    />
  );
}