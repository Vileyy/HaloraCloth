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

const ProductCard = ({ item, index, navigation }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [liked, setLiked] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  return (
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
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCardPress}
        style={styles.cardContent}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Badge */}
          {(item.isNew || item.isHot) && (
            <View
              style={[
                styles.badge,
                item.isNew ? styles.newBadge : styles.hotBadge,
              ]}
            >
              <Text style={styles.badgeText}>{item.isNew ? "NEW" : "HOT"}</Text>
            </View>
          )}

          {/* Heart Icon */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={toggleLike}
            activeOpacity={0.7}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={16}
              color={liked ? "#FF4757" : "#bdc3c7"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.productImage} />
          <View style={styles.imageOverlay}>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.05)"]}
              style={styles.gradient}
            />
          </View>
        </View>

        {/* Brand */}
        <Text style={styles.brandText}>{item.brand}</Text>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Rating & Sold */}
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.soldText}>
              Đã bán{" "}
              {item.sold > 1000
                ? `${(item.sold / 1000).toFixed(1)}k`
                : item.sold}
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>
                ₫{item.price.toLocaleString()}
              </Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₫{item.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E8E"]}
            style={styles.addBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bag-add-outline" size={14} color="#fff" />
            <Text style={styles.addBtnText}>Thêm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function NewArrivals({ onSeeAll, navigation }) {
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
        // Map lại dữ liệu cho phù hợp với UI
        const mapped = data.products.map((item) => ({
          id: item.id.toString(),
          name: item.title,
          price: item.price,
          originalPrice: item.price + Math.round(item.price * 0.15), // giả lập giá gốc cao hơn 15%
          discount: item.discountPercentage
            ? Math.round(item.discountPercentage)
            : 10,
          image: { uri: item.thumbnail },
          isNew: item.rating > 4.5, // Giả lập hàng mới về nếu rating cao
          isHot: item.stock > 50, // Giả lập hot nếu stock lớn
          rating: item.rating,
          sold: item.stock, // dùng stock làm số lượng bán demo
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
                  outputRange: [-15, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Hàng mới về</Text>
          <Text style={styles.subtitle}>Cập nhật xu hướng mới nhất</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={14} color="#FF6B6B" />
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
        snapToInterval={width * 0.45}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  listContent: {
    paddingRight: 16,
  },
  productCard: {
    width: width * 0.44,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 50,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: "#f1f2f6",
  },
  cardContent: {
    padding: 12,
    position: "relative",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  newBadge: {
    backgroundColor: "#27ae60",
  },
  hotBadge: {
    backgroundColor: "#e74c3c",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 10,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  gradient: {
    flex: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  brandText: {
    fontSize: 11,
    color: "#95a5a6",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
    marginLeft: 3,
  },
  soldText: {
    fontSize: 11,
    color: "#95a5a6",
    fontWeight: "500",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRow: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  currentPrice: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "700",
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 12,
    color: "#bdc3c7",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  discountBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addBtn: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
