import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useOrders, Order } from "../../src/contexts/OrderContext";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

interface TrackingStage {
  stage: string;
  icon: string;
  color: string;
  bgColor: string;
}

const TrackOrderScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trackingStages: TrackingStage[] = [
    {
      stage: "Order Placed",
      icon: "checkmark-circle",
      color: theme.colors.green[600],
      bgColor: theme.colors.green[600],
    },
    {
      stage: "Order Confirmed",
      icon: "checkmark-done",
      color: theme.colors.primary[500],
      bgColor: theme.colors.primary[500],
    },
    {
      stage: "Packed",
      icon: "cube",
      color: theme.colors.purple[600],
      bgColor: theme.colors.purple[600],
    },
    {
      stage: "Shipped",
      icon: "car",
      color: theme.colors.orange[600],
      bgColor: theme.colors.orange[600],
    },
    {
      stage: "Out for Delivery",
      icon: "location",
      color: theme.colors.yellow[500],
      bgColor: theme.colors.yellow[500],
    },
    {
      stage: "Delivered",
      icon: "gift",
      color: theme.colors.green[600],
      bgColor: theme.colors.green[600],
    },
  ];

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      console.log("🔄 [TrackOrder] Loading order details for:", orderId);

      if (!orderId) {
        console.error("❌ [TrackOrder] No orderId provided");
        Toast.show({
          type: "error",
          text1: "No Order ID",
          text2: "Invalid order reference",
        });
        return;
      }

      const orderData = await getOrderById(orderId);
      if (orderData) {
        console.log(
          "✅ [TrackOrder] Order loaded successfully:",
          orderData.orderId
        );
        setOrder(orderData);
      } else {
        console.log("⚠️ [TrackOrder] Order not found for ID:", orderId);
        // Don't show error toast, as this might be a temporary network issue
        // The user can still see their orders in the orders list
      }
    } catch (error) {
      console.error("❌ [TrackOrder] Error loading order:", error);
      // Only show error toast for actual errors, not for order not found
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        console.log("⚠️ [TrackOrder] Order not found in API");
      } else {
        Toast.show({
          type: "error",
          text1: "Error loading order",
          text2: "Please try again later",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetails();
    setRefreshing(false);
  };

  const getCurrentStageIndex = (): number => {
    if (!order) return 0;
    const stageMap: { [key: string]: number } = {
      placed: 0,
      confirmed: 1,
      packed: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
    };
    return stageMap[order.status] || 0;
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
          <Text style={styles.headerTitle}>Track Order</Text>
        </LinearGradient>

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
          <Text style={styles.headerTitle}>Track Order</Text>
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Ionicons
            name="receipt-outline"
            size={80}
            color={theme.colors.gray[400]}
          />
          <Text style={styles.errorTitle}>Loading Order Details</Text>
          <Text style={styles.errorSubtitle}>
            If this takes too long, please check your connection
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadOrderDetails}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={theme.colors.primary[600]}
            />
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.homeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStageIndex = getCurrentStageIndex();

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>
            Order ID: #{order._id?.slice(-8).toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.timelineCard}>
            {trackingStages.map((stage, index) => {
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineContent}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: isCompleted
                            ? stage.bgColor
                            : theme.colors.gray[200],
                        },
                        isCurrent && styles.currentStageIcon,
                      ]}
                    >
                      <Ionicons
                        name={stage.icon as any}
                        size={20}
                        color={
                          isCompleted
                            ? theme.colors.white
                            : theme.colors.gray[400]
                        }
                      />
                    </View>

                    {/* Content */}
                    <View style={styles.timelineText}>
                      <Text
                        style={[
                          styles.stageName,
                          {
                            color: isCompleted
                              ? theme.colors.gray[800]
                              : theme.colors.gray[400],
                          },
                        ]}
                      >
                        {stage.stage}
                      </Text>
                      {isCompleted && (
                        <Text style={styles.stageDescription}>
                          Your order has been {stage.stage.toLowerCase()}
                        </Text>
                      )}
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Connecting Line */}
                  {index < trackingStages.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            index < currentStageIndex
                              ? theme.colors.green[600]
                              : theme.colors.gray[200],
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}

            {/* Estimated Delivery */}
            <View style={styles.estimatedDelivery}>
              <LinearGradient
                colors={[theme.colors.primary[50], theme.colors.green[50]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.estimatedDeliveryCard}
              >
                <View style={styles.estimatedDeliveryContent}>
                  <Ionicons
                    name="car-outline"
                    size={24}
                    color={theme.colors.primary[600]}
                  />
                  <View style={styles.estimatedDeliveryText}>
                    <Text style={styles.estimatedDeliveryLabel}>
                      Estimated Delivery
                    </Text>
                    <Text style={styles.estimatedDeliveryDate}>
                      {getEstimatedDelivery()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemImageContainer}>
                  {item.image ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${item.image}` }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={theme.colors.gray[400]}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemBrand}>
                    {item.attributes?.brand || "Brand"}
                  </Text>
                  <View style={styles.itemPricing}>
                    <Text style={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons
                name="home-outline"
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
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={theme.colors.gray[500]}
                />
                <Text style={styles.contactText}>
                  {order.deliveryAddress.phone}
                </Text>
              </View>
              {order.deliveryAddress.email && (
                <View style={styles.contactItem}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={theme.colors.gray[500]}
                  />
                  <Text style={styles.contactText}>
                    {order.deliveryAddress.email}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>
                ₹{order.pricing.subtotal.toFixed(2)}
              </Text>
            </View>

            {order.pricing.discount > 0 && (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, styles.discountLabel]}>
                  Discount
                </Text>
                <Text style={[styles.paymentValue, styles.discountValue]}>
                  -₹{order.pricing.discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text
                style={[
                  styles.paymentValue,
                  order.pricing.deliveryFee === 0 && styles.freeDelivery,
                ]}
              >
                {order.pricing.deliveryFee === 0
                  ? "FREE"
                  : `₹${order.pricing.deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{order.pricing.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodBadge}>
                <Text style={styles.paymentMethodText}>
                  {order.paymentInfo.method.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={styles.paymentStatusBadge}>
                <Text style={styles.paymentStatusText}>
                  {order.paymentInfo.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={[theme.colors.primary[50], theme.colors.green[50]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.helpCard}
          >
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpSubtitle}>
              Contact our customer support for any queries
            </Text>
            <TouchableOpacity style={styles.helpButton}>
              <LinearGradient
                colors={theme.gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.helpButtonGradient}
              >
                <Ionicons
                  name="headset-outline"
                  size={20}
                  color={theme.colors.white}
                />
                <Text style={styles.helpButtonText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  refreshButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary[600],
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
  timelineCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  timelineItem: {
    position: "relative",
  },
  timelineContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  currentStageIcon: {
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timelineText: {
    flex: 1,
  },
  stageName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  stageDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  currentBadge: {
    backgroundColor: theme.colors.orange[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
    marginTop: theme.spacing.xs,
  },
  currentBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.orange[700],
  },
  timelineLine: {
    position: "absolute",
    left: 19,
    top: 40,
    width: 2,
    height: 40,
  },
  estimatedDelivery: {
    marginTop: theme.spacing.lg,
  },
  estimatedDeliveryCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  estimatedDeliveryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  estimatedDeliveryText: {
    flex: 1,
  },
  estimatedDeliveryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  estimatedDeliveryDate: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
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
    marginBottom: theme.spacing.lg,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  itemBrand: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  itemPricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemQuantity: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  itemPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
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
  contactInfo: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
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
  discountLabel: {
    color: theme.colors.green[600],
  },
  discountValue: {
    color: theme.colors.green[600],
  },
  freeDelivery: {
    color: theme.colors.green[600],
    fontWeight: theme.typography.weights.bold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
  paymentMethodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  paymentMethodBadge: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  paymentMethodText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[700],
  },
  paymentStatusBadge: {
    backgroundColor: theme.colors.green[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  paymentStatusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.green[700],
  },
  helpCard: {
    marginHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  helpTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  helpSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  helpButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  helpButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  helpButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  bottomSpacing: {
    height: theme.spacing.xxxl,
  },
});

export default TrackOrderScreen;
