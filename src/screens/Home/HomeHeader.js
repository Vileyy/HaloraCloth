import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

export default function HomeHeader({ navigation, onSearchChange }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Get user info and cart data from Redux
  const user = useSelector((state) => state.user.userInfo);
  const cartItems = useSelector((state) => state.cart.items);
  const userData = useSelector((state) => state.user.userData);

  // Calculate cart item count
  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Get user display name from database or fallback
  const getUserDisplayName = () => {
    if (userData?.displayName) {
      return userData.displayName;
    }
    if (user?.displayName) {
      return user.displayName;
    } else if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Khách";
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.spring(searchAnimation, {
      toValue: 1,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.spring(searchAnimation, {
      toValue: 0,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  };

  const searchBoxStyle = {
    borderColor: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ["#e5e7eb", "#667eea"],
    }),
    shadowOpacity: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.15],
    }),
    transform: [
      {
        scale: searchAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Section */}
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.userSection}
            onPress={() => {
              if (!user) {
                navigation.navigate("Login");
              } else {
                navigation.navigate("Profile");
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.userIconContainer}>
              <Image
                source={require("../../assets/images/UserIcon.png")}
                style={styles.userIcon}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
              {!user && (
                <Text style={styles.loginHint}>Đăng nhập để mua sắm</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            {/* You can add real notification count here later */}
            <Animated.View
              style={[styles.badge, { transform: [{ scale: pulseAnimation }] }]}
            >
              <Text style={styles.badgeText}>0</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="bag-outline" size={24} color="#374151" />
            {cartItemCount > 0 && (
              <View style={styles.smallBadge}>
                <Text style={styles.smallBadgeText}>
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchBox, searchBoxStyle]}>
          <View style={styles.searchIconContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={isSearchFocused ? "#667eea" : "#9ca3af"}
            />
          </View>
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (onSearchChange) onSearchChange(text);
            }}
          />
          {isSearchFocused && searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              activeOpacity={0.7}
              onPress={() => {
                setSearchText("");
                if (onSearchChange) onSearchChange("");
              }}
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </Animated.View>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <View style={styles.filterIconContainer}>
            <Ionicons name="options-outline" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#ffffff",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 30,
    backgroundColor: "#fafafa",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIconContainer: {
    position: "relative",
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    borderWidth: 3,
    borderColor: "#ffffff",
  },

  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  loginHint: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "500",
    marginTop: 2,
  },
  iconButton: {
    padding: 12,
    marginLeft: 8,
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  smallBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#667eea",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  smallBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 16,
    padding: 14,
    backgroundColor: "#667eea",
    borderRadius: 20,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
