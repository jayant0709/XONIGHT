import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";
import { CartToast } from "./CartToast";

interface CustomToastProps {
  text1?: string;
  text2?: string;
  type: "success" | "error" | "info";
}

export const CustomToast = ({ text1, text2, type }: CustomToastProps) => {
  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme.colors.green[500],
          icon: "checkmark-circle",
          iconColor: theme.colors.white,
        };
      case "error":
        return {
          backgroundColor: theme.colors.red[500],
          icon: "close-circle",
          iconColor: theme.colors.white,
        };
      case "info":
        return {
          backgroundColor: theme.colors.primary[500],
          icon: "information-circle",
          iconColor: theme.colors.white,
        };
      default:
        return {
          backgroundColor: theme.colors.gray[500],
          icon: "information-circle",
          iconColor: theme.colors.white,
        };
    }
  };

  const config = getToastConfig();

  return (
    <View
      style={[styles.container, { backgroundColor: config.backgroundColor }]}
    >
      <View style={styles.content}>
        <Ionicons
          name={config.icon as any}
          size={24}
          color={config.iconColor}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          {text1 && <Text style={styles.title}>{text1}</Text>}
          {text2 && <Text style={styles.subtitle}>{text2}</Text>}
        </View>
      </View>
    </View>
  );
};

export const toastConfig = {
  cart: (props: any) => <CartToast text1={props.text1} text2={props.text2} />,
  success: (props: any) => (
    <CustomToast type="success" text1={props.text1} text2={props.text2} />
  ),
  error: (props: any) => (
    <CustomToast type="error" text1={props.text1} text2={props.text2} />
  ),
  info: (props: any) => (
    <CustomToast type="info" text1={props.text1} text2={props.text2} />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginHorizontal: "5%",
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 2,
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    opacity: 0.9,
  },
});
