import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../src/constants/theme";

const SignInScreen = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(usernameOrEmail.trim(), password);

      if (result.success) {
        router.replace("/(main)/home");
      } else {
        Alert.alert("Sign In Failed", result.error || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={theme.gradients.background.warm}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* App Logo/Icon */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={theme.gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoCircle}
              >
                <Ionicons
                  name="storefront"
                  size={40}
                  color={theme.colors.white}
                />
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your XONIGHT account and continue shopping
              </Text>
            </View>

            {/* Form Card */}
            <LinearGradient
              colors={[theme.colors.white, theme.colors.primary[50] + "30"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formCard}
            >
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={theme.colors.gray[600]}
                    />{" "}
                    Username or Email
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={theme.colors.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={usernameOrEmail}
                      onChangeText={setUsernameOrEmail}
                      placeholder="Enter your username or email"
                      placeholderTextColor={theme.colors.gray[400]}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color={theme.colors.gray[600]}
                    />{" "}
                    Password
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={theme.colors.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.colors.gray[400]}
                      secureTextEntry={!showPassword}
                      textContentType="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={theme.colors.gray[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.signInButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? [theme.colors.gray[400], theme.colors.gray[500]]
                        : theme.gradients.brand
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.signInButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        color={theme.colors.white}
                        size="small"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="log-in-outline"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.signInButtonText}>Sign In</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <Link href="/signup" asChild>
                    <TouchableOpacity style={styles.signUpLinkContainer}>
                      <Text style={styles.signUpLink}>Sign Up</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={theme.colors.primary[600]}
                      />
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.medium,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    fontSize: theme.typography.sizes["3xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[600],
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  formCard: {
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
    overflow: "hidden",
  },
  form: {
    padding: theme.spacing.xxxl,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[800],
    fontWeight: theme.typography.weights.medium,
  },
  eyeIcon: {
    padding: theme.spacing.md,
  },
  signInButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  signInButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
    fontWeight: theme.typography.weights.medium,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  signUpText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
  },
  signUpLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  signUpLink: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weights.bold,
  },
});

export default SignInScreen;
