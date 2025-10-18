import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { useCart } from "../../src/contexts/CartContext";
import { useWishlist } from "../../src/contexts/WishlistContext";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";
import theme from "../../src/constants/theme";
import HeroBanner from "../../src/components/HeroBanner";
import WelcomeSection from "../../src/components/WelcomeSection";
import FeaturedProductsSection from "../../src/components/FeaturedProductsSection";
import NewsletterSection from "../../src/components/NewsletterSection";

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  images: string[];
  categories: string[]; // Your backend uses categories array
  category?: string; // Keep this for backward compatibility
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

interface Promotion {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  discountPercentage?: number;
}

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { addToCart, state: cartState, refreshCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchPromotions(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      console.log("Products API Response:", response.data);

      // Your backend returns { products: [...], pagination: {...} }
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        console.log("✅ Loaded", response.data.products.length, "products");
      } else {
        console.log("⚠️ No products found in response");
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load products. Please check your connection.",
      });
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.get("/api/promotions");
      console.log("Promotions API Response:", response.data);

      // Check the actual structure your backend returns
      if (response.data && response.data.promotions) {
        setPromotions(response.data.promotions);
      } else if (response.data && Array.isArray(response.data)) {
        setPromotions(response.data);
      } else {
        console.log("⚠️ No promotions found in response");
        setPromotions([]);
      }
    } catch (error) {
      console.error("❌ Error fetching promotions:", error);
      // Don't show error for promotions as it's optional
      setPromotions([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      console.log("Categories API Response:", response.data);

      // Your backend returns { categories: [...] }
      if (response.data && response.data.categories) {
        const cats = response.data.categories;
        setCategories(["All", ...cats]);
        console.log("✅ Loaded categories:", ["All", ...cats]);
      } else {
        console.log("⚠️ No categories found in response");
        setCategories(["All"]);
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load categories. Please check your connection.",
      });
      setCategories(["All"]);
    }
  };

  const handleAddToCart = async (product: Product) => {
    addToCart(product);
    Toast.show({
      type: "cart",
      text1: "Added to Cart! 🛒",
      text2: `${product.name} has been added to your cart.`,
    });

    // Refresh cart after a brief delay to ensure sync
    setTimeout(() => {
      console.log("🔄 [HomeScreen] Refreshing cart after add to cart");
      refreshCart();
    }, 1000);
  };

  const handleToggleWishlist = (product: Product) => {
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const filteredProducts = products.filter((product) => {
    // Your backend uses 'categories' (array) instead of 'category' (string)
    const matchesCategory =
      selectedCategory === "All" ||
      (product.categories && product.categories.includes(selectedCategory)) ||
      product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={theme.gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>X</Text>
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>XONIGHT</Text>
          <Text style={styles.brandSubtitle}>E-Commerce</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => router.push("/cart")}
        >
          <Ionicons
            name="basket-outline"
            size={24}
            color={theme.colors.white}
          />
          {cartState.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartState.totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#6B7280"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  const renderPromotions = () => {
    if (promotions.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promotionsScroll}
        >
          {promotions.map((promo, index) => {
            // Cycle through different gradient themes
            const gradientColors =
              theme.gradients.heroBanner[
                index % theme.gradients.heroBanner.length
              ].colors;

            return (
              <LinearGradient
                key={promo._id}
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoCard}
              >
                {/* Decorative circles */}
                <View style={styles.promoDecorations}>
                  <View style={[styles.decorCircle, styles.decorCircle1]} />
                  <View style={[styles.decorCircle, styles.decorCircle2]} />
                  <View style={[styles.decorCircle, styles.decorCircle3]} />
                </View>

                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoDescription}>
                    {promo.description}
                  </Text>
                  {promo.discountPercentage && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {promo.discountPercentage}% OFF
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        {categories.map((category, index) => {
          const isActive = selectedCategory === category;

          if (isActive) {
            return (
              <LinearGradient
                key={category}
                colors={theme.gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryChipActive}
              >
                <TouchableOpacity
                  style={styles.categoryChipContent}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryTextActive}>{category}</Text>
                </TouchableOpacity>
              </LinearGradient>
            );
          }

          return (
            <TouchableOpacity
              key={category}
              style={styles.categoryChip}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <Text style={styles.featuredTitle}>
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.featuredSubtitle}>
          {selectedCategory === "All"
            ? "Explore our complete collection of premium products carefully selected for you."
            : `Discover amazing products in ${selectedCategory} category.`}
        </Text>
      </View>
      <View style={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product._id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${product._id}`)}
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
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.wishlistButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(product);
                }}
              >
                <Ionicons
                  name={isInWishlist(product._id) ? "heart" : "heart-outline"}
                  size={20}
                  color={isInWishlist(product._id) ? "#EF4444" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productBrand}>
                {product.brand || product.attributes?.brand || "Unknown Brand"}
              </Text>
              <Text style={styles.productPrice}>
                ₹{product.price.toFixed(2)}
              </Text>
              <LinearGradient
                colors={theme.gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addToCartButton}
              >
                <TouchableOpacity
                  style={styles.addToCartButtonContent}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <Ionicons
                    name="basket-outline"
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        <WelcomeSection userName={user?.username} />
        {renderSearchBar()}
        <HeroBanner
          promotions={promotions}
          onShopNow={() => console.log("Shop now pressed")}
        />

        <FeaturedProductsSection
          title="Featured Products"
          subtitle="Handpicked products that our customers love. Discover quality and style in every item."
          products={filteredProducts.slice(0, 6)}
          onProductPress={(product) => router.push(`/product/${product._id}`)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
          showDiscount={true}
        />
        <FeaturedProductsSection
          title="Fashion & Lifestyle"
          subtitle="Stay trendy with our curated collection of fashion and lifestyle products."
          products={products.slice(6, 16)}
          onProductPress={(product) => router.push(`/product/${product._id}`)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
          showDiscount={true}
          carouselMode={true}
        />
        {/* {renderPromotions()} */}
        {renderCategories()}
        {renderProducts()}
        <View style={styles.sectionSpacing}>
          <NewsletterSection
            onSubscribe={async (email) => {
              // Handle newsletter subscription
              console.log("Newsletter subscription:", email);
              // You can add API call here
            }}
          />
        </View>
      </ScrollView>
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
  sectionSpacing: {
    paddingVertical: theme.spacing.lg,
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
  // Header styles with gradient background
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.small,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  logoText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  brandInfo: {
    justifyContent: "center",
  },
  brandName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  brandSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  cartIcon: {
    position: "relative",
    padding: theme.spacing.sm,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.colors.red[500],
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  logoutButton: {
    padding: theme.spacing.sm,
  },
  // Search bar styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.gray[100],
    ...theme.shadows.small,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[800],
    fontWeight: theme.typography.weights.medium,
  },
  // Section styles
  section: {
    marginBottom: theme.spacing.xxl + theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  // Promotional cards styles
  promotionsScroll: {
    paddingLeft: theme.spacing.xl,
  },
  promoCard: {
    width: 300,
    height: 160,
    marginRight: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    position: "relative",
    overflow: "hidden",
  },
  promoDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.full,
  },
  decorCircle1: {
    width: 60,
    height: 60,
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  decorCircle2: {
    width: 30,
    height: 30,
    top: theme.spacing.xxxl,
    right: theme.spacing.xxxl + theme.spacing.lg,
  },
  decorCircle3: {
    width: 40,
    height: 40,
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
  },
  promoContent: {
    position: "relative",
    zIndex: 1,
    padding: theme.spacing.xl,
    height: "100%",
    justifyContent: "space-between",
  },
  promoTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  promoDescription: {
    fontSize: theme.typography.sizes.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  discountBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  // Categories styles
  categoriesScroll: {
    paddingLeft: theme.spacing.xl,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    ...theme.shadows.small,
  },
  categoryChipActive: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: "transparent",
    ...theme.shadows.small,
  },
  categoryChipContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
  },
  categoryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.weights.medium,
  },
  categoryTextActive: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.white,
    fontWeight: theme.typography.weights.semibold,
  },
  // Products grid styles
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  productCard: {
    width: "47%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    ...theme.shadows.medium,
  },
  productImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: theme.borderRadius.lg,
  },
  placeholderImage: {
    width: "100%",
    height: 140,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm - 2,
    ...theme.shadows.medium,
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
    marginBottom: theme.spacing.sm,
    textTransform: "capitalize",
  },
  productPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.sm,
  },
  addToCartButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  addToCartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm + 2,
    gap: theme.spacing.xs,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  // Featured section title styles
  titleContainer: {
    alignItems: "center",
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  featuredTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gray[800],
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  featuredSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});

export default HomeScreen;
