import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "../../src/contexts/CartContext";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

const CartScreen = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleRemoveFromCart = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from your cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeFromCart(productId);
          Toast.show({
            type: "info",
            text1: "Item Removed",
            text2: `${productName} removed from cart.`,
          });
        },
      },
    ]);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      const item = state.items.find((item) => item.product._id === productId);
      if (item) {
        handleRemoveFromCart(productId, item.product.name);
      }
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCart();
            Toast.show({
              type: "info",
              text1: "Cart Cleared",
              text2: "All items removed from cart.",
            });
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    Toast.show({
      type: "info",
      text1: "Checkout",
      text2: "Checkout functionality coming soon!",
    });
  };

  if (state.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.title}>Shopping Cart</Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[theme.colors.gray[100], theme.colors.gray[50]]}
            style={styles.emptyIconContainer}
          >
            <Ionicons
              name="basket-outline"
              size={80}
              color={theme.colors.gray[400]}
            />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some products to get started shopping
          </Text>
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
        <Text style={styles.title}>Shopping Cart</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {state.items.map((item) => (
          <View
            key={`${item.product._id}-${JSON.stringify(
              item.selectedAttributes
            )}`}
            style={styles.cartItem}
          >
            <View style={styles.productImageContainer}>
              {item.product.images && item.product.images.length > 0 ? (
                <Image
                  source={{
                    uri: item.product.images[0].startsWith("data:")
                      ? item.product.images[0]
                      : `data:image/jpeg;base64,${item.product.images[0]}`,
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.productBrand}>
                {item.product.attributes?.brand || "Unknown Brand"}
              </Text>
              <Text style={styles.productPrice}>
                ${item.product.price.toFixed(2)}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item.product._id, item.quantity - 1)
                  }
                >
                  <Ionicons name="remove" size={16} color="#3B82F6" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item.product._id, item.quantity + 1)
                  }
                >
                  <Ionicons name="add" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() =>
                  handleRemoveFromCart(item.product._id, item.product.name)
                }
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.cartSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({state.totalItems})</Text>
          <Text style={styles.summaryValue}>
            ${state.totalPrice.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${state.totalPrice.toFixed(2)}</Text>
        </View>

        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkoutButton}
        >
          <TouchableOpacity
            style={styles.checkoutButtonContent}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.white}
            />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.small,
  },
  title: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm - 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  clearButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl + theme.spacing.sm,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    ...theme.shadows.small,
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1F2937",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  checkoutButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadows.medium,
  },
  checkoutButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  checkoutButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
});

export default CartScreen;
