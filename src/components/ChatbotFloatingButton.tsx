import React from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

interface ChatbotFloatingButtonProps {
  onPress: () => void;
}

const ChatbotFloatingButton: React.FC<ChatbotFloatingButtonProps> = ({
  onPress,
}) => {
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnimation }] }]}
    >
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={28}
            color={theme.colors.white}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90, // Above the bottom navigation
    right: theme.spacing.lg,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    ...theme.shadows.large,
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatbotFloatingButton;
