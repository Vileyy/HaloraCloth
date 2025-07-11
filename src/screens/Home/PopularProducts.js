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

const CARD_WIDTH = width * 0.42;

const ProductCard = ({ item, index, navigation }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
        toValue: 1.05,
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

  const discountPercent = Math.round(
    ((item.originalPrice - item.price) / item.originalPrice) * 100
  );

  return (
    <View style={styles.cardShadow}>
      <Animated.View
        style={[
          styles.productCard,
          {
            transform: [{ scale: scaleAnim }],
            marginLeft: index === 0 ? 16 : 0,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleCardPress}
          style={styles.cardContent}
        >
          {/* Heart Button */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={toggleLike}
            activeOpacity={0.7}
          >
            <View style={styles.heartBg}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={16}
                color={liked ? "#FF4757" : "#95a5a6"}
              />
            </View>
          </TouchableOpacity>

          {/* Popular Badge */}
          {item.isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="trending-up" size={10} color="#fff" />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.productImage} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.05)"]}
              style={styles.imageOverlay}
            />
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>${item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
            </View>
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(item.rating) ? "star" : "star-outline"}
                    size={12}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {item.rating} ({item.reviews})
              </Text>
            </View>
            {/* Color Options */}
            <View style={styles.colorContainer}>
              {item.colors.map((color, colorIndex) => (
                <TouchableOpacity
                  key={colorIndex}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === colorIndex && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(colorIndex)}
                />
              ))}
            </View>
          </View>

          {/* Buy Button */}
          <TouchableOpacity style={styles.buyBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.buyBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bag-add" size={16} color="#fff" />
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function PopularProducts({ onSeeAll, navigation }) {
  const [headerAnim] = useState(new Animated.Value(0));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://dummyjson.com/products?limit=10");
        const data = await res.json();
        // Map lại dữ liệu cho phù hợp với UI
        const mapped = data.products.map((item) => ({
          id: item.id.toString(),
          name: item.title,
          price: item.price,
          originalPrice: item.price + Math.round(item.price * 0.2), // giả lập giá gốc cao hơn 20%
          image: { uri: item.thumbnail },
          colors: ["#8B9DC3", "#E8E8E8"], // Dummy màu
          sizes: ["M", "L", "XL"], // Dummy size
          rating: item.rating,
          reviews: item.stock, // dùng stock làm số review demo
          isPopular: item.rating > 4.5,
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

  if (loading) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Popular</Text>
          <Text style={styles.subtitle}>Most loved by customers</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={16} color="#667eea" />
        </TouchableOpacity>
      </Animated.View>

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <ProductCard item={item} index={index} navigation={navigation} />
        )}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  listContent: {
    paddingRight: 16,
  },
  cardShadow: {
    width: CARD_WIDTH,
    marginRight: 20,
    borderRadius: 24,
    marginBottom: 10,
    marginLeft: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  productCard: {
    flex: 1,
    borderRadius: 24,
    paddingBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  cardContent: {
    padding: 16,
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
  },
  heartBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  popularText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 2,
    textTransform: "uppercase",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  productInfo: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  currentPrice: {
    fontSize: 18,
    color: "#27ae60",
    fontWeight: "800",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#95a5a6",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#667eea",
    borderWidth: 2,
  },
  buyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
