import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../src/constants/theme";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Custom function to determine if a tab should be focused
  const isTabFocused = (tabName: string) => {
    // Special case: if we're on track-order or order-success, keep orders tab active
    if (
      pathname.includes("/track-order") ||
      pathname.includes("/order-success")
    ) {
      return tabName === "orders";
    }

    // Default behavior
    return pathname.includes(`/${tabName}`);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 0,
          height: 70 + insets.bottom, // Increased height for better aesthetics
          paddingBottom: insets.bottom + 12, // More padding
          paddingTop: 12,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const focused = isTabFocused("home");
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? size + 2 : size}
                color={
                  focused ? theme.colors.primary[600] : theme.colors.gray[400]
                }
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const focused = isTabFocused("categories");
            return (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={focused ? size + 2 : size}
                color={
                  focused ? theme.colors.primary[600] : theme.colors.gray[400]
                }
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const focused = isTabFocused("orders");
            return (
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={focused ? size + 2 : size}
                color={
                  focused ? theme.colors.primary[600] : theme.colors.gray[400]
                }
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const focused = isTabFocused("cart");
            return (
              <Ionicons
                name={focused ? "basket" : "basket-outline"}
                size={focused ? size + 2 : size}
                color={
                  focused ? theme.colors.primary[600] : theme.colors.gray[400]
                }
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const focused = isTabFocused("profile");
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={focused ? size + 2 : size}
                color={
                  focused ? theme.colors.primary[600] : theme.colors.gray[400]
                }
              />
            );
          },
        }}
      />
      {/* Hidden screens - not shown in tabs */}
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="track-order"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-success"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
