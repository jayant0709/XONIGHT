import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useOrders, Order } from "../../src/contexts/OrderContext";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

const OrdersScreen = () => {
  const { state: orderState, loadOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error refreshing orders",
        text2: "Please try again",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return theme.colors.green[600];
      case "processing":
        return theme.colors.primary[600];
      case "shipped":
        return theme.colors.purple[600];
      case "delivered":
        return theme.colors.green[700];
      case "cancelled":
        return theme.colors.red[600];
      default:
        return theme.colors.orange[600];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "shipped":
        return "car";
      case "delivered":
        return "gift";
      case "cancelled":
        return "close-circle";
      default:
        return "hourglass";
    }
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleOrderPress = (order: Order) => {
    // Navigate to order success screen to view order details
    router.push({
      pathname: "/order-success",
      params: {
        orderId: order.orderId || order._id || "",
      },
    });
  };

  if (orderState.isLoading && orderState.orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      {orderState.orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[theme.colors.primary[50], theme.colors.green[50]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyCard}
          >
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="receipt-outline"
                size={80}
                color={theme.colors.gray[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you place orders, they'll appear here with detailed tracking
              information
            </Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => router.replace("/home")}
            >
              <LinearGradient
                colors={theme.gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shopNowGradient}
              >
                <Ionicons
                  name="bag-outline"
                  size={20}
                  color={theme.colors.white}
                />
                <Text style={styles.shopNowText}>Start Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.ordersContainer}>
            {orderState.orders.map((order: Order) => (
              <View key={order._id} style={styles.orderCard}>
                {/* Compact Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderMainInfo}>
                    <View style={styles.orderIdRow}>
                      <Ionicons
                        name="receipt"
                        size={16}
                        color={theme.colors.gray[600]}
                      />
                      <Text style={styles.orderIdText}>
                        #{order._id?.slice(-8).toUpperCase() || "UNKNOWN"}
                      </Text>
                      <Text style={styles.orderDateText}>
                        • {formatDate(order.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.orderSummaryRow}>
                      <Text style={styles.itemsText}>
                        {order.items?.length || 0}{" "}
                        {(order.items?.length || 0) === 1 ? "item" : "items"}
                      </Text>
                      <Text style={styles.totalText}>
                        ₹{(order.pricing?.total || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(order.status) as any}
                      size={12}
                      color={theme.colors.white}
                    />
                    <Text style={styles.statusText}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Compact Delivery Info */}
                <View style={styles.deliveryRow}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={theme.colors.green[600]}
                  />
                  <Text style={styles.deliveryText} numberOfLines={1}>
                    {order.deliveryAddress?.city || "Unknown"},{" "}
                    {order.deliveryAddress?.state || "Unknown"}
                  </Text>
                </View>

                {/* Compact Action Buttons */}
                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() =>
                      router.push({
                        pathname: "/track-order",
                        params: { orderId: order.orderId || "" },
                      })
                    }
                  >
                    <Ionicons
                      name="location"
                      size={14}
                      color={theme.colors.white}
                    />
                    <Text style={styles.trackButtonText}>Track</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleOrderPress(order)}
                  >
                    <Text style={styles.detailsButtonText}>Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={theme.colors.primary[600]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFBF8", // Matching web app background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.small,
  },
  backButton: {
    marginRight: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxxl,
    alignItems: "center",
    width: "100%",
    ...theme.shadows.medium,
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  shopNowButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.small,
  },
  shopNowGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  shopNowText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  orderHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderMainInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  orderIdText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  orderDateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
    fontWeight: theme.typography.weights.medium,
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
  },
  totalText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    minWidth: 80,
    justifyContent: "center",
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  deliveryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
    flex: 1,
  },
  orderActions: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  trackButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  detailsButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[600],
  },
  bottomSpacing: {
    height: theme.spacing.xxxl,
  },
});

export default OrdersScreen;
