import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("token/", {
        email: email.toLowerCase().trim(),
        password: password,
      });

      const { access, refresh } = response.data;
      await SecureStore.setItemAsync("accessToken", access);
      await SecureStore.setItemAsync("refreshToken", refresh);

      navigation.replace("Dashboard");
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert(
        "Login Failed",
        "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avila</Text>
      <Text style={styles.subtitle}>Secure Web3 Custody</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* THIS IS THE NEW SIGN UP LINK */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  form: { width: "100%" },
  input: {
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 15,
    // Add this line below to force the text to be black!
    color: "#000000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  linkButton: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#000", fontSize: 15, fontWeight: "500" },
});
