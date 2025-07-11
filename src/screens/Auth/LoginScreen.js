import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/userSlice";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      dispatch(setUserInfo({ email: user.email, uid: user.uid }));
      Alert.alert("Thông báo", "Đăng nhập thành công");
      navigation.navigate("Home");
    } catch (error) {
      setError("Email hoặc mật khẩu không chính xác");
      Alert.alert("Lỗi", "Email hoặc mật khẩu không chính xác");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/HaloraLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Chào mừng trở lại!</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để tiếp tục mua sắm cùng Halora
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            autoCapitalize="none"
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#2196F3",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#2196F3",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    color: "#666666",
    fontSize: 14,
  },
  registerLink: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#f44336",
    marginBottom: 16,
    fontSize: 14,
  },
});
