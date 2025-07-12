import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, Platform, Animated } from "react-native";
import { useSelector } from "react-redux";
import HomeScreen from "../screens/Home/HomeScreen";
import CartScreen from "../screens/Cart/CartScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: "home-outline",
  Cart: "cart-outline",
  Profile: "person-outline",
};
const TAB_ICONS_ACTIVE = {
  Home: "home",
  Cart: "cart",
  Profile: "person",
};
const TAB_LABELS = {
  Home: "Trang chủ",
  Cart: "Giỏ hàng",
  Profile: "Tài khoản",
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <View
      style={{
        backgroundColor: "transparent",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Platform.OS === "ios" ? 16 : 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderRadius: 32,

          marginHorizontal: 24,
          marginBottom: Platform.OS === "ios" ? 12 : 8,
          elevation: 10,
          shadowColor: "#667eea",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          paddingVertical: 8,
          paddingHorizontal: 8,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const scaleValue = React.useRef(
            new Animated.Value(isFocused ? 1.2 : 1)
          ).current;
          React.useEffect(() => {
            Animated.spring(scaleValue, {
              toValue: isFocused ? 1.2 : 1,
              useNativeDriver: true,
              friction: 6,
            }).start();
          }, [isFocused]);
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                descriptors[route.key].options.tabBarAccessibilityLabel
              }
              testID={descriptors[route.key].options.tabBarTestID}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Ionicons
                  name={
                    isFocused
                      ? TAB_ICONS_ACTIVE[route.name]
                      : TAB_ICONS[route.name]
                  }
                  size={28}
                  color={isFocused ? "#667eea" : "#b0b0b0"}
                />
                {route.name === "Cart" && cartItemCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "#FF4458",
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </Text>
                  </View>
                )}
              </Animated.View>
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: isFocused ? "#667eea" : "#b0b0b0",
                  fontWeight: isFocused ? "700" : "500",
                }}
              >
                {TAB_LABELS[route.name]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
