import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/theme";

interface HeroBannerProps {
  promotions: any[];
  onShopNow?: () => void;
}

const { width } = Dimensions.get("window");

const HeroBanner: React.FC<HeroBannerProps> = ({ promotions, onShopNow }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const heroSlides = [
    {
      id: 1,
      title: "Big Billion Days",
      subtitle: "Up to 70% Off",
      description: "On Electronics & More",
      buttonText: "Shop Now",
      badge: "Limited Time",
      gradient: [theme.colors.orange[500], theme.colors.pink[500]] as const,
      icon: "flash",
    },
    {
      id: 2,
      title: "Fashion Sale",
      subtitle: "Min. 50% Off",
      description: "On Latest Trends",
      buttonText: "Explore",
      badge: "New Arrivals",
      gradient: [theme.colors.purple[500], theme.colors.primary[500]] as const,
      icon: "shirt",
    },
    {
      id: 3,
      title: "Home & Living",
      subtitle: "Up to 60% Off",
      description: "Make Your Home Beautiful",
      buttonText: "Shop Now",
      badge: "Best Deals",
      gradient: [theme.colors.green[500], theme.colors.teal[500]] as const,
      icon: "home",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % heroSlides.length;
      setCurrentSlide(nextSlide);

      // Animate transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Scroll to next slide
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextSlide * width,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentSlide, fadeAnim]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * width,
        animated: true,
      });
    }
  };

  const currentBanner = heroSlides[currentSlide];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
      >
        {heroSlides.map((slide, index) => (
          <Animated.View
            key={slide.id}
            style={[styles.slide, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={slide.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slideContent}
            >
              {/* Background Pattern */}
              <View style={styles.backgroundPattern}>
                <View style={[styles.patternCircle, styles.pattern1]} />
                <View style={[styles.patternCircle, styles.pattern2]} />
                <View style={[styles.patternCircle, styles.pattern3]} />
                <View style={[styles.patternCircle, styles.pattern4]} />
                <View style={[styles.patternCircle, styles.pattern5]} />
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.textSection}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{slide.badge}</Text>
                  </View>

                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                  <Text style={styles.description}>{slide.description}</Text>

                  <TouchableOpacity style={styles.button} onPress={onShopNow}>
                    <Text style={styles.buttonText}>{slide.buttonText}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={theme.colors.gray[800]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.iconSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={slide.icon as any}
                      size={40}
                      color={theme.colors.white}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {heroSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentSlide
                    ? theme.colors.white
                    : "rgba(255, 255, 255, 0.5)",
              },
            ]}
          />
        ))}
      </View>

      {/* Promotional Cards */}
      {promotions.length > 0 && (
        <View style={styles.promoCardsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoCardsContent}
          >
            {promotions.slice(0, 3).map((promo, index) => (
              <LinearGradient
                key={promo._id}
                colors={
                  [theme.colors.red[500], theme.colors.yellow[500]] as const
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoCard}
              >
                <View style={styles.promoCardContent}>
                  <Text style={styles.promoCardTitle}>{promo.title}</Text>
                  <Text style={styles.promoCardDescription}>
                    {promo.description}
                  </Text>
                  <View style={styles.promoCardFooter}>
                    <Text style={styles.promoCode}>
                      Code: {promo.promo_code || "SAVE50"}
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {promo.discount_value || 50}% Off
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Decorative Elements */}
                <View style={styles.promoDecorations}>
                  <View style={[styles.decorCircle, styles.decorLarge]} />
                  <View style={[styles.decorCircle, styles.decorSmall]} />
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
  },
  slide: {
    width,
    height: 200,
  },
  slideContent: {
    flex: 1,
    overflow: "hidden",
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternCircle: {
    position: "absolute",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
  },
  pattern1: {
    width: 32,
    height: 32,
    top: 16,
    left: 16,
  },
  pattern2: {
    width: 16,
    height: 16,
    top: 48,
    left: 48,
  },
  pattern3: {
    width: 24,
    height: 24,
    top: 32,
    right: 32,
  },
  pattern4: {
    width: 20,
    height: 20,
    bottom: 32,
    left: 32,
  },
  pattern5: {
    width: 28,
    height: 28,
    bottom: 16,
    right: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  textSection: {
    flex: 2,
  },
  iconSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  description: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginRight: theme.spacing.xs,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
  },
  promoCardsContainer: {
    paddingBottom: theme.spacing.lg,
  },
  promoCardsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  promoCard: {
    width: 280,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    position: "relative",
    overflow: "hidden",
    ...theme.shadows.medium,
  },
  promoCardContent: {
    position: "relative",
    zIndex: 10,
  },
  promoCardTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  promoCardDescription: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  promoCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoCode: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  discountBadge: {
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
  decorLarge: {
    width: 64,
    height: 64,
    top: 8,
    right: 8,
  },
  decorSmall: {
    width: 32,
    height: 32,
    bottom: 16,
    right: 16,
  },
});

export default HeroBanner;
