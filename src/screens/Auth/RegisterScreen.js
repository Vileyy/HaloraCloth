import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useDispatch } from "react-redux";
import {
  setUserInfo,
  saveUserAsync,
  fetchUserAsync,
} from "../../redux/slices/userSlice";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Hide status bar
    StatusBar.setHidden(true);

    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger input animations
    inputAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 600 + index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !displayName) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setError("");
    return true;
  };

  const handleRegister = async () => {
    animateButton();

    if (!validateForm()) {
      shakeAnimation();
      Alert.alert("Lỗi", error);
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: displayName,
      });

      await dispatch(
        saveUserAsync({
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          photoURL: user.photoURL || "",
        })
      ).unwrap();

      try {
        await dispatch(fetchUserAsync(user.uid)).unwrap();
      } catch (error) {
        console.log("Error fetching user data after registration:", error);
      }

      dispatch(
        setUserInfo({
          email: user.email,
          uid: user.uid,
          displayName: displayName,
        })
      );

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.error("Register error:", error);
      let errorMessage = "Đã có lỗi xảy ra";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email này đã được sử dụng";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ";
      }
      setError(errorMessage);
      shakeAnimation();
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Gradient */}
          <LinearGradient
            colors={["#2196F3", "#1976D2", "#0D47A1"]}
            style={styles.backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Decorative Circles */}
          <View style={styles.circleDecoration1} />
          <View style={styles.circleDecoration2} />
          <View style={styles.circleDecoration3} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/HaloraLogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình mua sắm của bạn
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff5252" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  opacity: inputAnimations[0],
                  transform: [
                    {
                      translateX: inputAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.inputContainer,
                  nameFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={nameFocused ? "#2196F3" : "#9E9E9E"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Tên của bạn"
                  placeholderTextColor="#9E9E9E"
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </Animated.View>

            {/* Email Input */}
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  opacity: inputAnimations[1],
                  transform: [
                    {
                      translateX: inputAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? "#2196F3" : "#9E9E9E"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email của bạn"
                  placeholderTextColor="#9E9E9E"
                  value={email}
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={styles.input}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  opacity: inputAnimations[2],
                  transform: [
                    {
                      translateX: inputAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? "#2196F3" : "#9E9E9E"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  placeholderTextColor="#9E9E9E"
                  value={password}
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9E9E9E"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  opacity: inputAnimations[3],
                  transform: [
                    {
                      translateX: inputAnimations[3].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.inputContainer,
                  confirmPasswordFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={confirmPasswordFocused ? "#2196F3" : "#9E9E9E"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#9E9E9E"
                  value={confirmPassword}
                  autoCapitalize="none"
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#9E9E9E"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Register Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isLoading ? ["#90CAF9", "#64B5F6"] : ["#2196F3", "#1976D2"]
                  }
                  style={styles.registerButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Text style={styles.registerButtonText}>
                      Đang đăng ký...
                    </Text>
                  ) : (
                    <View style={styles.registerButtonContent}>
                      <Text style={styles.registerButtonText}>Đăng ký</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#ffffff"
                        style={styles.arrowIcon}
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Terms and Conditions */}
            <Text style={styles.termsText}>
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{" "}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  circleDecoration1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  circleDecoration2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 80,
    left: -30,
  },
  circleDecoration3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: 200,
    right: 30,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputContainerFocused: {
    borderColor: "#2196F3",
    backgroundColor: "#E3F2FD",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  termsText: {
    textAlign: "center",
    fontSize: 13,
    color: "#666666",
    marginBottom: 24,
    lineHeight: 20,
  },
  termsLink: {
    color: "#2196F3",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#666666",
    fontSize: 16,
  },
  loginLink: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
});
