import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.48;
const CARD_SPACING = 12;

const ProductCard = ({ item, index, navigation }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [liked, setLiked] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = () => {
    navigation.navigate("ProductDetail", { product: item });
  };

  const toggleLike = () => {
    setLiked(!liked);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const discountPercent = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : item.discount;

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          transform: [{ scale: scaleAnim }],
          marginLeft: index === 0 ? 16 : CARD_SPACING,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCardPress}
        style={styles.cardTouchable}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <Image source={item.image} style={styles.productImage} />

          {/* Overlays */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.05)"]}
            style={styles.imageGradient}
          />

          {/* Top Row Badges */}
          <View style={styles.topRow}>
            {(item.isNew || item.isHot) && (
              <View
                style={[
                  styles.badge,
                  item.isNew ? styles.newBadge : styles.hotBadge,
                ]}
              >
                <Ionicons
                  name={item.isNew ? "sparkles" : "flame"}
                  size={12}
                  color="#fff"
                />
                <Text style={styles.badgeText}>
                  {item.isNew ? "NEW" : "HOT"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.heartButton}
              onPress={toggleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={18}
                color={liked ? "#FF4458" : "#2c3e50"}
              />
            </TouchableOpacity>
          </View>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Brand */}
          <Text style={styles.brand}>
            {item.brand?.toUpperCase() || "NO BRAND"}
          </Text>

          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Rating & Sold */}
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={10} color="#FFC107" />
              <Text style={styles.ratingValue}>{item.rating}</Text>
            </View>
            <View style={styles.soldContainer}>
              <Ionicons name="bag-check" size={10} color="#8e8e93" />
              <Text style={styles.soldText}>
                {item.sold > 1000
                  ? `${(item.sold / 1000).toFixed(1)}k`
                  : item.sold}
              </Text>
            </View>
          </View>

          {/* Price & Button Row */}
          <View style={styles.bottomRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>₫{item.price.toLocaleString()}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₫{item.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function NewArrivals({ onSeeAll, navigation, searchText = "" }) {
  const [headerAnim] = useState(new Animated.Value(0));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://dummyjson.com/products?limit=10&skip=10"
        );
        const data = await res.json();
        const mapped = data.products.map((item) => ({
          id: item.id.toString(),
          name: item.title,
          price: item.price * 23000, // Convert to VND
          originalPrice: (item.price + Math.round(item.price * 0.15)) * 23000,
          discount: item.discountPercentage
            ? Math.round(item.discountPercentage)
            : 10,
          image: { uri: item.thumbnail },
          isNew: item.rating > 4.5,
          isHot: item.stock > 50,
          rating: item.rating,
          sold: item.stock * 10, // Simulate sold count
          brand: item.brand || "No Brand",
          description: item.description,
        }));
        setProducts(mapped);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo searchText
  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, { animationDelay: "0.2s" }]} />
        <View style={[styles.loadingDot, { animationDelay: "0.4s" }]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Animated.View
        style={[
          styles.sectionHeader,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Hàng mới về</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ProductCard item={item} index={index} navigation={navigation} />
        )}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8e8e93",
    fontWeight: "400",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  viewAllIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  productsList: {
    paddingRight: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTouchable: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
    height: 180,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  topRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newBadge: {
    backgroundColor: "#2ecc71",
  },
  hotBadge: {
    backgroundColor: "#FF4458",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  contentSection: {
    padding: 16,
  },
  brand: {
    fontSize: 11,
    color: "#8e8e93",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 20,
    marginBottom: 8,
    minHeight: 40,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  soldText: {
    fontSize: 12,
    color: "#8e8e93",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceGroup: {
    flexDirection: "column",
    gap: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  originalPrice: {
    fontSize: 13,
    color: "#8e8e93",
    textDecorationLine: "line-through",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
