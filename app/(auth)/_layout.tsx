import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // 👈 Get current route

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      }

      setChecking(false);
    };

    checkToken();
  }, []); // 👈 Depend on pathname to avoid infinite reruns

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Checking login...</Text>
      </View>
    );
  }

  return   <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>;
}
