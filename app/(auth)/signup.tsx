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

const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();

  const validateForm = () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signup(username.trim(), email.trim(), password);

      if (result.success) {
        Alert.alert(
          "Success",
          "Account created successfully! Please sign in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/signin"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Sign Up Failed",
          result.error || "Failed to create account"
        );
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
                colors={theme.gradients.promo.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoCircle}
              >
                <Ionicons
                  name="person-add"
                  size={40}
                  color={theme.colors.white}
                />
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join XONIGHT family and discover amazing products with AI
                assistance
              </Text>
            </View>

            {/* Form Card */}
            <LinearGradient
              colors={[theme.colors.white, theme.colors.yellow[50] + "20"]}
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
                    Username
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="at-outline"
                      size={20}
                      color={theme.colors.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter your username"
                      placeholderTextColor={theme.colors.gray[400]}
                      autoCapitalize="none"
                      textContentType="username"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={theme.colors.gray[600]}
                    />{" "}
                    Email Address
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail"
                      size={20}
                      color={theme.colors.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email address"
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
                      placeholder="Create a strong password"
                      placeholderTextColor={theme.colors.gray[400]}
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
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

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={theme.colors.gray[600]}
                    />{" "}
                    Confirm Password
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={theme.colors.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor={theme.colors.gray[400]}
                      secureTextEntry={!showConfirmPassword}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={20}
                        color={theme.colors.gray[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.signUpButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? [theme.colors.gray[400], theme.colors.gray[500]]
                        : theme.gradients.promo.primary
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.signUpButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        color={theme.colors.white}
                        size="small"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="rocket-outline"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.signUpButtonText}>
                          Create Account
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>
                    Already have an account?{" "}
                  </Text>
                  <Link href="/signin" asChild>
                    <TouchableOpacity style={styles.signInLinkContainer}>
                      <Text style={styles.signInLink}>Sign In</Text>
                      <Ionicons
                        name="log-in-outline"
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
    paddingVertical: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.xl,
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
    padding: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
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
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[800],
    fontWeight: theme.typography.weights.medium,
  },
  eyeIcon: {
    padding: theme.spacing.md,
  },
  signUpButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  signUpButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
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
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  signInText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
  },
  signInLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  signInLink: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weights.bold,
  },
});

export default SignUpScreen;
