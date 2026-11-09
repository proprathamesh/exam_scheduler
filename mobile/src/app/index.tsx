
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = "access_token";

type User = {
  id: number;
  email: string;
  role: "admin" | "faculty" | "student";
  is_active: boolean;
};

type SessionStatus =
  | "checking"
  | "signedOut"
  | "signedIn"
  | "offline";

async function fetchProfile(token: string): Promise<User> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("INVALID_SESSION");
  }

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const restoreSession = useCallback(async () => {
    setStatus("checking");
    setErrorMessage("");

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) {
        setUser(null);
        setStatus("signedOut");
        return;
      }

      try {
        const profile = await fetchProfile(token);
        setUser(profile);
        setStatus("signedIn");
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "INVALID_SESSION"
        ) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setUser(null);
          setStatus("signedOut");
        } else {
          // A network failure is not proof of an expired token.
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to reach the backend"
          );
          setStatus("offline");
        }
      }
    } catch {
      setErrorMessage("Unable to access secure storage.");
      setStatus("offline");
    }
  }, []);

  // Restore authentication on initial app launch.
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // Revalidate when the app returns from the background.
  useEffect(() => {
    const listener = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active" && status === "signedIn") {
          void restoreSession();
        }
      }
    );

    return () => listener.remove();
  }, [restoreSession, status]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter your email and password.");
      return;
    }

    if (!API_URL) {
      Alert.alert("Configuration error", "Backend URL is missing.");
      return;
    }

    setLoading(true);

    try {
      const form = new URLSearchParams();
      form.append("username", email.trim().toLowerCase());
      form.append("password", password);

      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      if (response.status === 401) {
        throw new Error("Incorrect email or password.");
      }

      if (!response.ok) {
        throw new Error(`Login failed: HTTP ${response.status}`);
      }

      const data: { access_token: string } = await response.json();

      // Verify the token before saving the session.
      const profile = await fetchProfile(data.access_token);

      await SecureStore.setItemAsync(
        TOKEN_KEY,
        data.access_token
      );

      setUser(profile);
      setPassword("");
      setStatus("signedIn");
    } catch (error) {
      Alert.alert(
        "Login error",
        error instanceof Error
          ? error.message
          : "Unable to complete login."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
      setPassword("");
      setStatus("signedOut");
    } catch {
      Alert.alert("Error", "Unable to clear the saved session.");
    }
  }

  if (status === "checking") {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.description}>
          Checking saved session...
        </Text>
      </SafeAreaView>
    );
  }

  if (status === "offline") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Connection unavailable</Text>
          <Text style={styles.description}>{errorMessage}</Text>
          <Pressable
            style={styles.button}
            onPress={() => void restoreSession()}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
          <Pressable onPress={() => void handleLogout()}>
            <Text style={styles.link}>Clear session and log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "signedIn" && user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Session Active</Text>
          <Text style={styles.description}>
            Welcome, {user.email}
          </Text>
          <Text style={styles.role}>
            Role: {user.role.toUpperCase()}
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => void handleLogout()}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Exam Scheduler</Text>
        <Text style={styles.description}>
          University Examination Management
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[styles.button, loading && styles.disabled]}
          onPress={() => void handleLogin()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#F3F6FB",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#172554",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: "#64748B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  role: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "500",
  },
});
