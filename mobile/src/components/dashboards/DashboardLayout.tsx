
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type DashboardUser = {
  id: number;
  email: string;
  role: "admin" | "faculty" | "student";
  is_active: boolean;
};

export type DashboardSection = {
  title: string;
  description: string;
};

type Props = {
  user: DashboardUser;
  title: string;
  subtitle: string;
  sections: DashboardSection[];
  onLogout: () => void | Promise<void>;
};

export default function DashboardLayout({
  user,
  title,
  subtitle,
  sections,
  onLogout,
}: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>EXAM SCHEDULER</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.label}>SIGNED IN AS</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>
          {user.role.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.sectionHeading}>
        Your Workspace
      </Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.featureCard}>
          <Text style={styles.featureTitle}>
            {section.title}
          </Text>
          <Text style={styles.featureDescription}>
            {section.description}
          </Text>
          <Text style={styles.comingSoon}>
            Available in a future module
          </Text>
        </View>
      ))}

      <Pressable
        style={styles.logoutButton}
        onPress={() => void onLogout()}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 48,
    gap: 14,
  },
  header: {
    paddingBottom: 10,
  },
  appName: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
    marginTop: 10,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: "#DBEAFE",
    padding: 18,
    borderRadius: 14,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#172554",
  },
  role: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172554",
    marginTop: 8,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  featureDescription: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
  },
  comingSoon: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 6,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
});
