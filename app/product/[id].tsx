import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "../../src/contexts/CartContext";
import { useWishlist } from "../../src/contexts/WishlistContext";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  images: string[];
  categories: string[];
  category?: string;
  description: string;
  stock: number;
  status: string;
  brand?: string;
  attributes?: {
    brand?: string;
    color?: string;
    [key: string]: any;
  };
}

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/products/${id}`);
      console.log("Product API Response:", response.data);

      // Your backend returns { product: {...} }
      if (response.data && response.data.product) {
        setProduct(response.data.product);
        console.log("✅ Loaded product:", response.data.product.name);
      } else {
        console.log("⚠️ Product not found in response");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Product not found.",
        });
        router.back();
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load product details.",
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, selectedQuantity);
    Toast.show({
      type: "cart",
      text1: "Added to Cart! 🛒",
      text2: `${selectedQuantity} ${product.name} added to your cart.`,
    });
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      Toast.show({
        type: "info",
        text1: "Removed from Wishlist",
        text2: `${product.name} removed from wishlist.`,
      });
    } else {
      addToWishlist(product._id);
      Toast.show({
        type: "success",
        text1: "Added to Wishlist",
        text2: `${product.name} added to wishlist.`,
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCart(product, selectedQuantity);
    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: "Redirecting to cart...",
    });

    // Navigate to cart after a short delay
    setTimeout(() => {
      router.push("/(main)/cart");
    }, 1000);
  };

  if (isLoading) {
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
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
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
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.red[500]}
          />
          <Text style={styles.errorText}>Product not found</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          onPress={handleToggleWishlist}
          style={styles.wishlistButton}
        >
          <Ionicons
            name={isInWishlist(product._id) ? "heart" : "heart-outline"}
            size={24}
            color={
              isInWishlist(product._id)
                ? theme.colors.red[500]
                : theme.colors.white
            }
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setSelectedImageIndex(index);
            }}
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{
                    uri: image.startsWith("data:")
                      ? image
                      : `data:image/jpeg;base64,${image}`,
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={80} color="#9CA3AF" />
              </View>
            )}
          </ScrollView>

          {product.images && product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.brandContainer}>
              <Text style={styles.productBrand}>
                {product.brand || product.attributes?.brand || "Unknown Brand"}
              </Text>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.productPrice}>
                ₹{product.price.toFixed(2)}
              </Text>
              <View style={styles.stockBadge}>
                <Ionicons
                  name={product.stock > 0 ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={
                    product.stock > 0
                      ? theme.colors.green[500]
                      : theme.colors.red[500]
                  }
                />
                <Text
                  style={[
                    styles.stockText,
                    {
                      color:
                        product.stock > 0
                          ? theme.colors.green[600]
                          : theme.colors.red[600],
                    },
                  ]}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>SKU: {product.sku}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Stock: {product.stock}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Category: {product.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <View style={styles.attributesSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.attributes).map(([key, value]) => (
                <View key={key} style={styles.attributeItem}>
                  <Text style={styles.attributeKey}>{key}:</Text>
                  <Text style={styles.attributeValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <View style={styles.attributesSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.attributeValue}>
                {product.categories.join(", ")}
              </Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                }
              >
                <Ionicons name="remove" size={20} color="#3B82F6" />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{selectedQuantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setSelectedQuantity(
                    Math.min(product.stock, selectedQuantity + 1)
                  )
                }
              >
                <Ionicons name="add" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addToCartButton}
        >
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Ionicons
              name="basket-outline"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={theme.gradients.promo.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buyNowButton}
        >
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={handleBuyNow}
            disabled={product.stock === 0}
          >
            <Ionicons
              name="flash-outline"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.buyNowText}>Buy Now</Text>
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
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  headerRight: {
    width: 40,
  },
  wishlistButton: {
    padding: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.full,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray[50],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[500],
    fontWeight: theme.typography.weights.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray[50],
  },
  errorText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.red[500],
    fontWeight: theme.typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
    backgroundColor: theme.colors.white,
  },
  productImage: {
    width: width,
    height: 350,
  },
  placeholderImage: {
    width: width,
    height: 350,
    backgroundColor: theme.colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicators: {
    position: "absolute",
    bottom: theme.spacing.lg,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  productInfo: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
  },
  productHeader: {
    marginBottom: theme.spacing.xxl,
  },
  productName: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
    lineHeight: 32,
  },
  brandContainer: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  productBrand: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  productPrice: {
    fontSize: theme.typography.sizes["3xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  stockText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  productMeta: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray[100],
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: -theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
  },
  descriptionSection: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[600],
    lineHeight: 24,
    fontWeight: theme.typography.weights.normal,
  },
  attributesSection: {
    marginBottom: theme.spacing.xxl,
  },
  attributeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  attributeKey: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.gray[600],
    textTransform: "capitalize",
  },
  attributeValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[800],
    fontWeight: theme.typography.weights.medium,
  },
  quantitySection: {
    marginBottom: theme.spacing.xl,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.small,
  },
  quantityText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
    minWidth: 60,
    textAlign: "center",
  },
  bottomActions: {
    flexDirection: "row",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
    gap: theme.spacing.md,
    ...theme.shadows.large,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  buyNowButton: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  buyNowText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default ProductDetailScreen;
