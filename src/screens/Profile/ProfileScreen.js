import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import defaultAvatar from "../../assets/images/default_avatar.png";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const userData = useSelector((state) => state.user.userData);
  const loading = useSelector((state) => state.user.loading);
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 1,
      title: "Thông tin cá nhân",
      subtitle: "Cập nhật thông tin của bạn",
      icon: "person-outline",
      iconType: "Ionicons",
    },
    {
      id: 2,
      title: "Địa chỉ",
      subtitle: "Quản lý địa chỉ giao hàng",
      icon: "location-outline",
      iconType: "Ionicons",
    },
    {
      id: 3,
      title: "Đơn hàng của tôi",
      subtitle: "Xem lịch sử mua hàng",
      icon: "receipt-outline",
      iconType: "Ionicons",
    },
    {
      id: 4,
      title: "Phương thức thanh toán",
      subtitle: "Thẻ đã lưu và ví điện tử",
      icon: "card-outline",
      iconType: "Ionicons",
    },
    {
      id: 5,
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      icon: "notifications-outline",
      iconType: "Ionicons",
    },
    {
      id: 6,
      title: "Bảo mật",
      subtitle: "Mật khẩu và xác thực",
      icon: "shield-check-outline",
      iconType: "Ionicons",
    },
    {
      id: 7,
      title: "Ngôn ngữ",
      subtitle: "Tiếng Việt",
      icon: "language",
      iconType: "MaterialIcons",
    },
    {
      id: 8,
      title: "Trung tâm trợ giúp",
      subtitle: "Câu hỏi thường gặp",
      icon: "help-circle",
      iconType: "Feather",
    },
    {
      id: 9,
      title: "Về chúng tôi",
      subtitle: "Thông tin ứng dụng",
      icon: "info",
      iconType: "Feather",
    },
  ];

  const renderIcon = (iconName, iconType) => {
    const iconProps = { name: iconName, size: 24, color: "#666" };
    switch (iconType) {
      case "Ionicons":
        return <Ionicons {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons {...iconProps} />;
      case "Feather":
        return <Feather {...iconProps} />;
      default:
        return <Ionicons {...iconProps} />;
    }
  };

  const handleMenuPress = (item) => {
    console.log("Pressed:", item.title);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        onPress: () => {
          navigation.navigate("Login");
        },
      },
    ]);
  };

  // Xử lý loading hoặc chưa đăng nhập
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ marginTop: 16, color: "#888" }}>
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="person-circle-outline" size={80} color="#bbb" />
          <Text style={{ marginTop: 16, color: "#888", fontSize: 16 }}>
            Bạn chưa đăng nhập
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  let avatarUrl = userData.photoURL || userData.avatar;
  if (!avatarUrl) avatarUrl = defaultAvatar;
  const displayName =
    userData.displayName || userData.email?.split("@")[0] || "Người dùng";
  const email = userData.email || "Chưa cập nhật";
  let joinDate = "Chưa rõ";
  if (userData.createdAt) {
    const date = new Date(userData.createdAt);
    joinDate = `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  }
  const verified = userData.verified || false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  typeof avatarUrl === "string" ? { uri: avatarUrl } : avatarUrl
                }
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{displayName}</Text>
                {verified && (
                  <MaterialIcons
                    name="verified"
                    size={20}
                    color="#4CAF50"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              <Text style={styles.userEmail}>{email}</Text>
              <Text style={styles.joinDate}>Thành viên từ {joinDate}</Text>
            </View>
          </View>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>128</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>
          </View>
        </View>
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  {renderIcon(item.icon, item.iconType)}
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { marginBottom: 90 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 25,
    marginTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2196F3",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF5252",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});

export default ProfileScreen;
