import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useOrders, Order } from "../../src/contexts/OrderContext";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

const OrderSuccessScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 [OrderSuccess] Loading order with ID:", orderId);
      const orderData = await getOrderById(orderId!);
      console.log(
        "📋 [OrderSuccess] Received order data:",
        JSON.stringify(orderData, null, 2)
      );

      if (orderData) {
        setOrder(orderData);
        console.log("✅ [OrderSuccess] Order set successfully");
      } else {
        // If order details can't be loaded, show a basic success message
        console.log(
          "⚠️ [OrderSuccess] Order details not available, but order was created successfully"
        );
      }
    } catch (error) {
      console.error("❌ [OrderSuccess] Error loading order:", error);
      // Don't show error toast - the order was created successfully
      // Just log the error and continue showing success
    } finally {
      setLoading(false);
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

  const getEstimatedDelivery = () => {
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[theme.colors.green[500], theme.colors.green[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.successHeader}
        >
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={theme.colors.white}
            />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed and is being processed.
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.orderCard}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>
              #{orderId?.slice(-8).toUpperCase() || "PENDING"}
            </Text>
            <Text style={styles.infoText}>
              We'll send you updates via SMS and email as your order progresses.
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.trackOrderButton}
            onPress={() =>
              router.push({
                pathname: "/track-order",
                params: { orderId: orderId || "" },
              })
            }
          >
            <LinearGradient
              colors={theme.gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackOrderGradient}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.trackOrderText}>Track Order</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <LinearGradient
          colors={[theme.colors.green[500], theme.colors.green[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.successHeader}
        >
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={theme.colors.white}
            />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your order. We'll send you updates via SMS and email.
          </Text>
        </LinearGradient>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderIdValue}>
                  #{order._id?.slice(-8).toUpperCase() || "UNKNOWN"}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.gray[500]}
                />
                <Text style={styles.infoText}>
                  Order Date:
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.gray[500]}
                />
                <Text style={styles.infoText}>
                  Estimated Delivery: {getEstimatedDelivery()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={theme.colors.gray[500]}
                />
                <Text style={styles.infoText}>
                  Payment: {order.paymentInfo.method.toUpperCase()} •{" "}
                  {order.paymentInfo.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Ordered */}
        {order.items && order.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Items Ordered ({order.items.length})
            </Text>
            <View style={styles.itemsCard}>
              {order.items.map((item: any, index: number) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} • ₹{(item.price || 0).toFixed(2)}{" "}
                      each
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary[600]}
              />
              <Text style={styles.addressName}>
                {order.deliveryAddress.fullName}
              </Text>
            </View>
            <Text style={styles.addressText}>
              {order.deliveryAddress.address}
            </Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state} -{" "}
              {order.deliveryAddress.pincode}
            </Text>
            <Text style={styles.addressPhone}>
              📞 {order.deliveryAddress.phone}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        {order.pricing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>
                  ₹{(order.pricing?.subtotal || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                <Text
                  style={[
                    styles.paymentValue,
                    (order.pricing?.deliveryFee || 0) === 0 &&
                      styles.freeDelivery,
                  ]}
                >
                  {(order.pricing?.deliveryFee || 0) === 0
                    ? "FREE"
                    : `₹${(order.pricing?.deliveryFee || 0).toFixed(2)}`}
                </Text>
              </View>

              {(order.pricing?.discount || 0) > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Discount</Text>
                  <Text style={[styles.paymentValue, styles.discountValue]}>
                    -₹{(order.pricing?.discount || 0).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>
                  ₹{(order.pricing?.total || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.trackOrderButton}
          onPress={() => router.push("/orders" as any)}
        >
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackOrderGradient}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.trackOrderText}>Track Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  errorSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  homeButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  homeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  successHeader: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  successIcon: {
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.white,
    textAlign: "center",
    opacity: 0.9,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  orderCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  orderIdLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
  },
  orderIdValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  orderInfo: {
    gap: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  itemsCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  itemDetails: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  itemTotal: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
  },
  addressCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addressName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
  },
  addressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  addressPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weights.medium,
    marginTop: theme.spacing.sm,
  },
  paymentCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  paymentLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[600],
  },
  paymentValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[800],
  },
  freeDelivery: {
    color: theme.colors.green[600],
    fontWeight: theme.typography.weights.bold,
  },
  discountValue: {
    color: theme.colors.green[600],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: theme.spacing.md,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
  },
  actionButtons: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.large,
  },
  trackOrderButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  trackOrderGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  trackOrderText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  continueShoppingButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  continueShoppingText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
  },
});

export default OrderSuccessScreen;
