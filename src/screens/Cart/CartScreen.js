import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  removeFromCartAsync,
  updateCartItemAsync,
  clearCartAsync,
} from "../../redux/slices/cartSlice";
import { auth } from "../../services/firebase";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.userInfo);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // Lưu id các sản phẩm được chọn

  useEffect(() => {
    if (user) {
      dispatch(fetchCartItems(user.uid));
    }
  }, [dispatch, user]);

  // Nếu items thay đổi (ví dụ xóa sản phẩm), loại bỏ các id không còn tồn tại khỏi selectedItems
  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => items.some((item) => item.id === id))
    );
  }, [items]);

  const handleToggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleQuantityChange = async (item, change) => {
    if (!user) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    setUpdatingItem(item.id);
    try {
      await dispatch(
        updateCartItemAsync({
          userId: user.uid,
          itemId: item.id,
          updates: { quantity: newQuantity },
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật số lượng",
        position: "top",
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!user) return;

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(
                removeFromCartAsync({
                  userId: user.uid,
                  itemId: itemId,
                })
              ).unwrap();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Lỗi", "Không thể xóa sản phẩm");
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    if (!user) return;

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(clearCartAsync(user.uid)).unwrap();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert("Lỗi", "Không thể xóa giỏ hàng");
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Tính tổng tiền các sản phẩm đã chọn
  const calculateSelectedTotal = () => {
    return items
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#8e8e93" />
          <Text style={styles.emptyTitle}>Cần đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập để xem giỏ hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#8e8e93" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("Home")}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shopButtonGradient}
            >
              <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Giỏ hàng ({calculateItemCount()})
        </Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Ionicons name="trash-outline" size={24} color="#FF4458" />
        </TouchableOpacity>
      </View>

      {/* Chọn tất cả */}
      {items.length > 0 && (
        <TouchableOpacity style={styles.selectAllRow} onPress={handleSelectAll}>
          <Ionicons
            name={
              selectedItems.length === items.length
                ? "checkbox"
                : "square-outline"
            }
            size={22}
            color={
              selectedItems.length === items.length ? "#667eea" : "#b0b0b0"
            }
          />
          <Text style={styles.selectAllText}>Chọn tất cả</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {/* Checkbox chọn sản phẩm */}
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggleSelect(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  selectedItems.includes(item.id)
                    ? "checkbox"
                    : "square-outline"
                }
                size={22}
                color={selectedItems.includes(item.id) ? "#667eea" : "#b0b0b0"}
              />
            </TouchableOpacity>
            <Image source={item.image} style={styles.itemImage} />

            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.itemPrice}>
                ₫{item.price.toLocaleString("vi-VN")}
              </Text>

              {item.selectedSize && (
                <Text style={styles.itemSize}>Size: {item.selectedSize}</Text>
              )}

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    item.quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(item, -1)}
                  disabled={item.quantity === 1 || updatingItem === item.id}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={item.quantity === 1 ? "#bdc3c7" : "#667eea"}
                  />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item, 1)}
                  disabled={updatingItem === item.id}
                >
                  <Ionicons name="add" size={16} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                ₫{(item.price * item.quantity).toLocaleString("vi-VN")}
              </Text>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF4458" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            ₫{calculateSelectedTotal().toLocaleString("vi-VN")}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.length === 0 && { opacity: 0.5 },
          ]}
          disabled={selectedItems.length === 0}
          onPress={() => {
            if (selectedItems.length === 0) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Toast.show({
              type: "success",
              text1: "Đặt hàng",
              text2: `Bạn đã đặt ${selectedItems.length} sản phẩm!`,
              position: "top",
            });
            // Xử lý logic đặt hàng thực tế ở đây nếu cần
          }}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    minWidth: 30,
    textAlign: "center",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginBottom: 70, // Đẩy lên trên tab bar
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#667eea",
  },
  checkoutButton: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  shopButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  loginButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8e8e93",
  },
  checkbox: {
    marginRight: 8,
    alignSelf: "center",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectAllText: {
    fontSize: 15,
    color: "#1a1a1a",
    marginLeft: 8,
    fontWeight: "500",
  },
});
