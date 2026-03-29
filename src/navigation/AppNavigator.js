import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";

// --- IMPORT YOUR SCREENS ---
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // REAL ACTION: Check if user is already logged in on startup
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        setUserToken(token);
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Show a spinner while checking SecureStore
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={userToken ? "Dashboard" : "Login"}
      screenOptions={{
        headerShown: false, // Cleaner "Wallet" look
        gestureEnabled: true,
      }}
    >
      {/* AUTH STACK */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* APP STACK */}
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          // Real Action: Prevent users from swiping "back" to the login screen
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
