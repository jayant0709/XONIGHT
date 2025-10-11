import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCart } from "../../src/contexts/CartContext";
import {
  useOrders,
  DeliveryAddress,
  PaymentInfo,
  OrderPricing,
} from "../../src/contexts/OrderContext";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

const CheckoutScreen = () => {
  const { state: cartState, clearCart } = useCart();
  const { createOrder } = useOrders();

  // Delivery Address State
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // Form validation and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [orderNotes, setOrderNotes] = useState("");

  // Calculate pricing (same as web app)
  const calculatePricing = (): OrderPricing => {
    const subtotal = cartState.totalPrice;
    const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over ₹500
    const discount = 0; // Can be calculated based on coupons
    const total = subtotal + deliveryFee - discount;

    return {
      subtotal,
      discount,
      deliveryFee,
      total,
    };
  };

  const pricing = calculatePricing();

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!deliveryAddress.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!deliveryAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(deliveryAddress.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!deliveryAddress.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!deliveryAddress.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!deliveryAddress.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!deliveryAddress.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout process
  const handleProceedToPayment = () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
        text2: "Check the form for errors and try again",
      });
      return;
    }

    // Show payment modal with order data (we'll implement this next)
    Alert.alert("Payment Options", "Choose your payment method", [
      {
        text: "Credit/Debit Card",
        onPress: () => handlePayment("card"),
      },
      {
        text: "UPI",
        onPress: () => handlePayment("upi"),
      },
      {
        text: "Cash on Delivery",
        onPress: () => handlePayment("cod"),
      },
      {
        text: "Net Banking",
        onPress: () => handlePayment("netbanking"),
      },
    ]);
  };

  // Handle payment processing (same backend API as web app)
  const handlePayment = async (paymentMethod: string) => {
    setIsLoading(true);

    try {
      const orderData = {
        items: cartState.items,
        deliveryAddress,
        paymentInfo: {
          method: paymentMethod as "card" | "upi" | "cod" | "netbanking",
          amount: pricing.total,
          status: paymentMethod === "cod" ? "pending" : "success",
          transactionId:
            paymentMethod === "cod" ? "COD_" + Date.now() : "TXN_" + Date.now(),
        } as PaymentInfo,
        pricing,
        orderNotes,
      };

      const newOrder = await createOrder(orderData);
      console.log("🎉 Order created:", newOrder);

      if (newOrder) {
        // Clear cart after successful order
        await clearCart();

        Toast.show({
          type: "success",
          text1: "Order Placed Successfully! 🎉",
          text2: `Order ID: ${
            newOrder._id || newOrder.orderId || "Processing"
          }`,
        });

        // Navigate to order success first, then they can track from there
        router.replace({
          pathname: "/order-success",
          params: {
            orderId: newOrder.orderId || newOrder._id || Date.now().toString(),
          },
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: "Please try again or contact support",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update address field
  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  // Check if cart is empty
  if (cartState.items.length === 0) {
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
          <Text style={styles.headerTitle}>Checkout</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="basket-outline"
            size={80}
            color={theme.colors.gray[400]}
          />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some items to proceed with checkout
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Checkout</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryCard}>
            <Text style={styles.orderSummaryText}>
              {cartState.totalItems}
              {cartState.totalItems === 1 ? "item" : "items"} • ₹
              {cartState.totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.editCartButton}
            >
              <Text style={styles.editCartText}>Edit Cart</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, errors.fullName && styles.inputError]}
                value={deliveryAddress.fullName}
                onChangeText={(text) => updateAddressField("fullName", text)}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.gray[400]}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={[styles.textInput, errors.phone && styles.inputError]}
                value={deliveryAddress.phone}
                onChangeText={(text) => updateAddressField("phone", text)}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={deliveryAddress.email}
                onChangeText={(text) => updateAddressField("email", text)}
                placeholder="Enter email address"
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  errors.address && styles.inputError,
                ]}
                value={deliveryAddress.address}
                onChangeText={(text) => updateAddressField("address", text)}
                placeholder="House no., Building, Street, Area"
                placeholderTextColor={theme.colors.gray[400]}
                multiline
                numberOfLines={3}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={[styles.textInput, errors.city && styles.inputError]}
                  value={deliveryAddress.city}
                  onChangeText={(text) => updateAddressField("city", text)}
                  placeholder="City"
                  placeholderTextColor={theme.colors.gray[400]}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              <View
                style={[styles.inputGroup, styles.flex1, styles.marginLeft]}
              >
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.pincode && styles.inputError,
                  ]}
                  value={deliveryAddress.pincode}
                  onChangeText={(text) => updateAddressField("pincode", text)}
                  placeholder="000000"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={[styles.textInput, errors.state && styles.inputError]}
                value={deliveryAddress.state}
                onChangeText={(text) => updateAddressField("state", text)}
                placeholder="Enter state"
                placeholderTextColor={theme.colors.gray[400]}
              />
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={deliveryAddress.landmark}
                onChangeText={(text) => updateAddressField("landmark", text)}
                placeholder="Nearby landmark"
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Special Instructions (Optional)
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={orderNotes}
            onChangeText={setOrderNotes}
            placeholder="Any special instructions for delivery..."
            placeholderTextColor={theme.colors.gray[400]}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Subtotal ({cartState.totalItems} items)
              </Text>
              <Text style={styles.priceValue}>
                ₹{pricing.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text
                style={[
                  styles.priceValue,
                  pricing.deliveryFee === 0 && styles.freeDelivery,
                ]}
              >
                {pricing.deliveryFee === 0
                  ? "FREE"
                  : `₹${pricing.deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            {pricing.discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount</Text>
                <Text style={[styles.priceValue, styles.discountValue]}>
                  -₹{pricing.discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{pricing.total.toFixed(2)}</Text>
            </View>

            {pricing.deliveryFee === 0 && (
              <Text style={styles.freeDeliveryNote}>
                🎉 You saved ₹50 on delivery!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Proceed to Payment Button */}
      <View style={styles.footer}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.proceedButton}
        >
          <TouchableOpacity
            style={styles.proceedButtonContent}
            onPress={handleProceedToPayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Text style={styles.proceedButtonText}>
                  Proceed to Payment • ₹{pricing.total.toFixed(2)}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
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
  scrollView: {
    flex: 1,
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
  orderSummaryCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.shadows.small,
  },
  orderSummaryText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[800],
  },
  editCartButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  editCartText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[600],
  },
  formContainer: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[800],
    backgroundColor: theme.colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.colors.red[500],
  },
  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.red[500],
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: theme.spacing.md,
  },
  priceCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  priceLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[600],
  },
  priceValue: {
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
  freeDeliveryNote: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.green[600],
    textAlign: "center",
    marginTop: theme.spacing.sm,
    fontWeight: theme.typography.weights.medium,
  },
  footer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.large,
  },
  proceedButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  proceedButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  proceedButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginBottom: theme.spacing.xl,
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
});

export default CheckoutScreen;
