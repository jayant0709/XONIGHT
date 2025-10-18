import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

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

interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  showDiscount?: boolean;
  carouselMode?: boolean;
}

const { width } = Dimensions.get("window");
const productCardWidth = width * 0.42;

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  title,
  subtitle,
  products,
  onProductPress,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  showDiscount = false,
  carouselMode = false,
}) => {
  const renderProduct = (product: Product, index: number) => (
    <TouchableOpacity
      key={product._id}
      style={[styles.productCard, carouselMode && styles.carouselProductCard]}
      onPress={() => onProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        {product.images && product.images.length > 0 ? (
          <Image
            source={{
              uri: product.images[0].startsWith("data:")
                ? product.images[0]
                : `data:image/jpeg;base64,${product.images[0]}`,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={40}
              color={theme.colors.gray[400]}
            />
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => onToggleWishlist(product)}
        >
          <Ionicons
            name={isInWishlist(product._id) ? "heart" : "heart-outline"}
            size={16}
            color={
              isInWishlist(product._id)
                ? theme.colors.red[500]
                : theme.colors.gray[600]
            }
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {showDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.floor(Math.random() * 50) + 20}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {product.brand && (
          <Text style={styles.productBrand}>{product.brand}</Text>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{product.price}</Text>
          {showDiscount && (
            <Text style={styles.originalPrice}>
              ₹{Math.floor(product.price * 1.4)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => onAddToCart(product)}
        >
          <Ionicons
            name="basket-outline"
            size={16}
            color={theme.colors.white}
          />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.titleUnderline} />
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {carouselMode ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {products
            .slice(0, 10)
            .map((product, index) => renderProduct(product, index))}
        </ScrollView>
      ) : (
        <View style={styles.gridContainer}>
          {products
            .slice(0, 6)
            .map((product, index) => renderProduct(product, index))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    maxWidth: "100%",
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
    textAlign: "center",
    lineHeight: 18,
    fontWeight: theme.typography.weights.normal,
    paddingHorizontal: theme.spacing.xl,
    maxWidth: "85%",
  },
  carouselContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    width: productCardWidth,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  carouselProductCard: {
    width: productCardWidth + 20,
  },
  productImageContainer: {
    position: "relative",
    height: 120,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.gray[100],
  },
  wishlistButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 28,
    height: 28,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.small,
  },
  discountBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.red[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  productBrand: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  productPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
  },
  originalPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default FeaturedProductsSection;
