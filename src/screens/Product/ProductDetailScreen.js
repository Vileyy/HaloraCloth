import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAsync } from "../../redux/slices/cartSlice";
import { auth } from "../../services/firebase";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = width;

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userInfo);
  const cartLoading = useSelector((state) => state.cart.loading);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: "clamp",
  });

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleModalQuantityChange = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === "increase") {
      setModalQuantity((prev) => prev + 1);
    } else if (type === "decrease" && modalQuantity > 1) {
      setModalQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Cần đăng nhập",
        text2: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        position: "top",
      });
      navigation.navigate("Login");
      return;
    }

    try {
      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
      };

      await dispatch(
        addToCartAsync({
          userId: user.uid,
          product: productWithSelections,
          quantity: modalQuantity,
        })
      ).unwrap();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: `Đã thêm ${modalQuantity} ${product.name} vào giỏ hàng`,
        position: "top",
      });
      setShowModal(false);
      setModalQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
        position: "top",
      });
    }
  };

  const handleBuyNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setModalQuantity(1);
    });
  };

  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.spring(fadeAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = product.colors || [
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fixed Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="cart-outline" size={24} color="#1a1a1a" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.floatingRight}>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="share-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingButton, styles.favoriteFloating]}
            onPress={toggleFavorite}
          >
            <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#FF4458" : "#1a1a1a"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Product Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ scale: imageScale }] },
          ]}
        >
          <Image source={product.image} style={styles.productImage} />
          {product.originalPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                %
              </Text>
            </View>
          )}

          <View style={styles.imageDots}>
            {[1, 2, 3, 4].map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === 0 && styles.activeDot]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {/* Brand and Name */}
          <View style={styles.titleSection}>
            <Text style={styles.brand}>
              {product.brand?.toUpperCase() || "PREMIUM BRAND"}
            </Text>
            <Text style={styles.productName}>{product.name}</Text>
          </View>

          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewCount}>
                ({product.reviews} reviews)
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewReviews}>Xem đánh giá →</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Giá bán</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  ₫{product.price.toLocaleString("vi-VN")}
                </Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₫{product.originalPrice.toLocaleString("vi-VN")}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.savingBox}>
              <Text style={styles.savingText}>
                Tiết kiệm{" "}
                {((product.originalPrice - product.price) / 1000).toFixed(0)}k
              </Text>
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Màu sắc</Text>
            <View style={styles.colorOptions}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === index && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(index)}
                >
                  {selectedColor === index && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Size Selection */}
          <View style={styles.optionSection}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Kích cỡ</Text>
              <TouchableOpacity>
                <Text style={styles.sizeGuide}>Hướng dẫn chọn size</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sizeOptions}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.selectedSizeOption,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.selectedSizeText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Số lượng</Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange("decrease")}
                  disabled={quantity === 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity === 1 ? "#bdc3c7" : "#667eea"}
                  />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange("increase")}
                >
                  <Ionicons name="add" size={20} color="#667eea" />
                </TouchableOpacity>
              </View>

              <View style={styles.stockInfo}>
                <Ionicons name="cube-outline" size={16} color="#8e8e93" />
                <Text style={styles.stockText}>
                  Còn {product.stock || 99} sản phẩm
                </Text>
              </View>
            </View>
          </View>

          {/* Product Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#667eea" />
              </View>
              <Text style={styles.featureText}>Đảm bảo chính hãng</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="sync" size={20} color="#667eea" />
              </View>
              <Text style={styles.featureText}>Đổi trả trong 30 ngày</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="car" size={20} color="#667eea" />
              </View>
              <Text style={styles.featureText}>Miễn phí vận chuyển</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>
              {product.description ||
                "Sản phẩm chất lượng cao, được thiết kế với công nghệ hiện đại và chất liệu tốt nhất. Phù hợp cho mọi hoạt động hàng ngày, mang lại sự thoải mái và phong cách cho người sử dụng."}
            </Text>
            <TouchableOpacity style={styles.readMore}>
              <Text style={styles.readMoreText}>Xem thêm</Text>
              <Ionicons name="chevron-down" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#667eea"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowGradient}
          >
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal Popup */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn số lượng</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#1a1a1a" />
                </TouchableOpacity>
              </View>

              {/* Product Info in Modal */}
              <View style={styles.modalProductInfo}>
                <Image
                  source={product.image}
                  style={styles.modalProductImage}
                />
                <View style={styles.modalProductDetails}>
                  <Text style={styles.modalProductName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.modalProductPrice}>
                    ₫{product.price.toLocaleString("vi-VN")}
                  </Text>
                  <View style={styles.modalStockInfo}>
                    <Ionicons name="cube-outline" size={14} color="#8e8e93" />
                    <Text style={styles.modalStockText}>
                      Còn {product.stock || 99} sản phẩm
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quantity Selector */}
              <View style={styles.modalQuantitySection}>
                <Text style={styles.modalQuantityLabel}>Số lượng</Text>
                <View style={styles.modalQuantityControls}>
                  <TouchableOpacity
                    style={[
                      styles.modalQuantityButton,
                      modalQuantity === 1 && styles.modalQuantityButtonDisabled,
                    ]}
                    onPress={() => handleModalQuantityChange("decrease")}
                    disabled={modalQuantity === 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={modalQuantity === 1 ? "#bdc3c7" : "#667eea"}
                    />
                  </TouchableOpacity>

                  <View style={styles.modalQuantityDisplay}>
                    <Text style={styles.modalQuantityText}>
                      {modalQuantity}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalQuantityButton}
                    onPress={() => handleModalQuantityChange("increase")}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Price */}
              <View style={styles.modalTotalSection}>
                <Text style={styles.modalTotalLabel}>Tổng cộng</Text>
                <Text style={styles.modalTotalPrice}>
                  ₫{(product.price * modalQuantity).toLocaleString("vi-VN")}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.modalAddToCartButton}
                  onPress={() => {
                    handleAddToCart();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalAddToCartGradient}
                  >
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.modalAddToCartText}>
                      Thêm vào giỏ hàng
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalBuyNowButton}
                  onPress={() => {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success
                    );
                    Toast.show({
                      type: "success",
                      text1: "Đặt hàng thành công!",
                      text2: `Đã đặt ${modalQuantity} ${product.name}`,
                      position: "top",
                    });
                    closeModal();
                  }}
                >
                  <LinearGradient
                    colors={["#2ecc71", "#27ae60"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalBuyNowGradient}
                  >
                    <Ionicons name="flash" size={20} color="#fff" />
                    <Text style={styles.modalBuyNowText}>Mua ngay</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Headers
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#fff",
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF4458",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  floatingHeader: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingRight: {
    flexDirection: "row",
    gap: 12,
  },
  favoriteFloating: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },

  // Image Section
  imageContainer: {
    backgroundColor: "#fff",
    height: IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: width,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 100,
    left: 16,
    backgroundColor: "#FF4458",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  imageDots: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
  },

  // Content
  contentContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingBottom: 100,
  },

  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  brand: {
    fontSize: 12,
    color: "#8e8e93",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 32,
  },

  ratingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  reviewCount: {
    fontSize: 14,
    color: "#8e8e93",
  },
  viewReviews: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },

  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: "#8e8e93",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  originalPrice: {
    fontSize: 18,
    color: "#8e8e93",
    textDecorationLine: "line-through",
  },
  savingBox: {
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Options
  optionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  sizeGuide: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },

  colorOptions: {
    flexDirection: "row",
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#667eea",
  },

  sizeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sizeOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedSizeOption: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  selectedSizeText: {
    color: "#fff",
  },

  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    minWidth: 30,
    textAlign: "center",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockText: {
    fontSize: 14,
    color: "#8e8e93",
  },

  // Features
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
    marginBottom: 20,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#1a1a1a",
    fontWeight: "500",
    textAlign: "center",
  },

  // Description
  descriptionSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#5a6c7d",
    lineHeight: 24,
    marginBottom: 12,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  buyNowButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyNowGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalProductInfo: {
    flexDirection: "row",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  modalProductDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  modalStockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modalStockText: {
    fontSize: 12,
    color: "#8e8e93",
  },
  modalQuantitySection: {
    marginBottom: 24,
  },
  modalQuantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  modalQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  modalQuantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  modalQuantityButtonDisabled: {
    opacity: 0.5,
  },
  modalQuantityDisplay: {
    minWidth: 60,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  modalQuantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalTotalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalTotalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalActionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalAddToCartButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalAddToCartGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalAddToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalBuyNowButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2ecc71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalBuyNowGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalBuyNowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
