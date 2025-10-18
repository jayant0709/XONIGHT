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
          <Ionicons
            name="receipt-outline"
            size={80}
            color={theme.colors.gray[400]}
          />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place orders, they'll appear here
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </TouchableOpacity>
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
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => handleOrderPress(order)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderIdText}>
                      Order #{order._id?.slice(-8).toUpperCase() || "UNKNOWN"}
                    </Text>
                    <Text style={styles.orderDateText}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(order.status) + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(order.status) as any}
                        size={16}
                        color={getStatusColor(order.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderContent}>
                  <View style={styles.orderItems}>
                    <Text style={styles.itemsText}>
                      {order.items?.length || 0}
                      {(order.items?.length || 0) === 1 ? " item" : " items"}
                    </Text>
                    <Text style={styles.totalText}>
                      ₹{(order.pricing?.total || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.deliveryInfo}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={theme.colors.gray[500]}
                    />
                    <Text style={styles.deliveryText} numberOfLines={1}>
                      {order.deliveryAddress?.city || "Unknown"},
                      {order.deliveryAddress?.state || "Unknown"}
                    </Text>
                  </View>
                </View>

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
                      name="location-outline"
                      size={16}
                      color={theme.colors.primary[600]}
                    />
                    <Text style={styles.trackButtonText}>Track Order</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleOrderPress(order)}
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
    backgroundColor: theme.colors.gray[50],
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
    gap: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  shopNowButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  shopNowText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderIdText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  orderDateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  orderContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  orderItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  itemsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  totalText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  deliveryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
    flex: 1,
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
    paddingTop: theme.spacing.md,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  trackButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[600],
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  detailsButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[600],
  },
  bottomSpacing: {
    height: theme.spacing.xxxl,
  },
});

export default OrdersScreen;
