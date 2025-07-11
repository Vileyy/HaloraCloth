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
  ScrollView,
} from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../../services/firebase";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/userSlice";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

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
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", error);
      return;
    }

    setIsLoading(true);
    try {
      // Đăng ký tài khoản với Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cập nhật tên hiển thị
      await updateProfile(user, {
        displayName: displayName,
      });

      // Lưu thông tin user vào Realtime Database
      const userRef = ref(database, "users/" + user.uid);
      await set(userRef, {
        displayName: displayName,
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        phoneNumber: null,
        address: null,
        avatar: null,
        role: "user",
        status: "active",
      });

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
      let errorMessage = "Đã có lỗi xảy ra";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email này đã được sử dụng";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ";
      }
      setError(errorMessage);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/HaloraLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>
            Đăng ký để trải nghiệm mua sắm cùng Halora
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên hiển thị</Text>
            <TextInput
              placeholder="Nhập tên của bạn"
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
            />
          </View>

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
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              autoCapitalize="none"
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginBottom: 80,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    marginTop: 10,
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
  registerButton: {
    backgroundColor: "#2196F3",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "#666666",
    fontSize: 14,
  },
  loginLink: {
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
