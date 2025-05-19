import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Layout() {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // 👈 Get current route

  useEffect(() => {
    const checkToken = async () => {
      console.log('Checking login status...');
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);

      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        if (pathname !== '/login') {
          console.log('Redirecting to /login...');
          router.replace('/login'); // ✅ Only redirect if not already there
        }
      }

      setChecking(false);
    };

    checkToken();
  }, [pathname]); // 👈 Depend on pathname to avoid infinite reruns

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Checking login...</Text>
      </View>
    );
  }

  return <Slot />;
}
