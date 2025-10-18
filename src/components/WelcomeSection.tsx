import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

interface WelcomeSectionProps {
  userName?: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  const features = [
    {
      icon: "rocket",
      title: "Free Delivery",
      description: "On orders above ₹499",
    },
    {
      icon: "shield-checkmark",
      title: "Secure Payment",
      description: "100% secure transactions",
    },
    {
      icon: "return-up-back",
      title: "Easy Returns",
      description: "7-day return policy",
    },
  ];

  return (
    <LinearGradient
      colors={theme.gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.pattern1]} />
        <View style={[styles.patternCircle, styles.pattern2]} />
        <View style={[styles.patternCircle, styles.pattern3]} />
        <View style={[styles.patternCircle, styles.pattern4]} />
        <View style={[styles.patternCircle, styles.pattern5]} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>
            Welcome{userName ? ` ${userName}` : ""} to
          </Text>
          <Text style={styles.brandTitle}>XONIGHT E-Commerce</Text>
          <Text style={styles.subtitle}>
            Discover amazing products at unbeatable prices
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.icon as any}
                  size={16}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    position: "relative",
    overflow: "hidden",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternCircle: {
    position: "absolute",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
  },
  pattern1: {
    width: 32,
    height: 32,
    top: 16,
    left: 40,
    // Animation can be added here
  },
  pattern2: {
    width: 24,
    height: 24,
    top: 48,
    right: 80,
  },
  pattern3: {
    width: 40,
    height: 40,
    bottom: 32,
    left: "25%",
  },
  pattern4: {
    width: 16,
    height: 16,
    top: "30%",
    right: 20,
  },
  pattern5: {
    width: 28,
    height: 28,
    bottom: 16,
    right: "30%",
  },
  content: {
    position: "relative",
    zIndex: 10,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  brandTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 18,
    paddingHorizontal: theme.spacing.md,
  },
  featuresContainer: {
    flexDirection: "column",
    gap: theme.spacing.xs,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 1,
  },
  featureDescription: {
    color: theme.colors.white,
    fontSize: 10,
    opacity: 0.8,
    lineHeight: 12,
  },
});

export default WelcomeSection;
