import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

interface CartToastProps {
  text1?: string;
  text2?: string;
}

export const CartToast = ({ text1, text2 }: CartToastProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="basket" size={20} color={theme.colors.white} />
        </View>
        <View style={styles.textContainer}>
          {text1 && <Text style={styles.title}>{text1}</Text>}
          {text2 && <Text style={styles.subtitle}>{text2}</Text>}
        </View>
        <View style={styles.checkIcon}>
          <Ionicons
            name="checkmark"
            size={18}
            color={theme.colors.green[500]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginHorizontal: "5%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.green[500],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.full,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 2,
  },
  subtitle: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  checkIcon: {
    backgroundColor: theme.colors.green[50],
    borderRadius: theme.borderRadius.full,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
