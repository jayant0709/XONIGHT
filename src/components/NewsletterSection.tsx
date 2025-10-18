import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

interface NewsletterSectionProps {
  onSubscribe?: (email: string) => void;
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  onSubscribe,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      }

      Alert.alert("Success!", "Thank you for subscribing to our newsletter!", [
        { text: "OK", onPress: () => setEmail("") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={theme.gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.pattern1]} />
        <View style={[styles.patternCircle, styles.pattern2]} />
        <View style={[styles.patternCircle, styles.pattern3]} />
        <View style={[styles.patternCircle, styles.pattern4]} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={40} color={theme.colors.white} />
        </View>

        <Text style={styles.title}>Stay Updated</Text>
        <Text style={styles.subtitle}>
          Subscribe to our newsletter and be the first to know about new
          products, exclusive deals, and special offers.
        </Text>

        <View style={styles.subscriptionContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.gray[400]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubscribe}
            disabled={isLoading}
          >
            <LinearGradient
              colors={
                [theme.colors.yellow[500], theme.colors.orange[500]] as const
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>...</Text>
              ) : (
                <>
                  <Text style={styles.buttonText}>Subscribe</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.colors.gray[800]}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefit}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.benefitText}>Exclusive deals</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.benefitText}>New arrivals first</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.benefitText}>No spam</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    position: "relative",
    overflow: "hidden",
    ...theme.shadows.large,
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
    width: 48,
    height: 48,
    top: 16,
    left: 40,
  },
  pattern2: {
    width: 64,
    height: 64,
    bottom: 16,
    right: 40,
  },
  pattern3: {
    width: 32,
    height: 32,
    top: "30%",
    right: 20,
  },
  pattern4: {
    width: 40,
    height: 40,
    bottom: "30%",
    left: 20,
  },
  content: {
    position: "relative",
    zIndex: 10,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
    maxWidth: "90%",
  },
  subscriptionContainer: {
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.gray[800],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
  },
  subscribeButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadows.large,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: theme.spacing.lg,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  benefitText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    opacity: 0.9,
  },
});

export default NewsletterSection;
