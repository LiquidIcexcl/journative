import { GlobalContextProvider } from '@/context/GlobalContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { checkLogin } from '@/lib/appwrite';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  const [userOnline, setUserOnline] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking auth status...');
        const isLoggedIn = await checkLogin();
        setUserOnline(isLoggedIn);
        console.log('用户已登录', isLoggedIn);
      } catch (error) {
        console.log('getUserInfo error', error);
        setUserOnline(false);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  if (!loaded || !isAuthChecked) {
    return null;
  }

  return (
    <GlobalContextProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {!userOnline ? (
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="(home)" options={{ headerShown: false }} />
            )}
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="detail/[post_id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </GlobalContextProvider>
  );
}