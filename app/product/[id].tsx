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
import { useCart } from "../../src/contexts/CartContext";
import { useWishlist } from "../../src/contexts/WishlistContext";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";

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
      type: "success",
      text1: "Added to Cart",
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
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
            color={isInWishlist(product._id) ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

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
            <Text style={styles.productBrand}>
              {product.brand || product.attributes?.brand || "Unknown Brand"}
            </Text>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
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
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons name="basket-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  wishlistButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
  },
  productImage: {
    width: width,
    height: 300,
  },
  placeholderImage: {
    width: width,
    height: 300,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "#FFFFFF",
  },
  productInfo: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  productHeader: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  productMeta: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    marginBottom: 24,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  attributesSection: {
    marginBottom: 24,
  },
  attributeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  attributeKey: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  attributeValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    minWidth: 40,
    textAlign: "center",
  },
  bottomActions: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buyNowButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 16,
  },
  buyNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductDetailScreen;
