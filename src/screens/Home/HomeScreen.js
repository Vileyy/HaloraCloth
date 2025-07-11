import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React from "react";
import HomeHeader from "./HomeHeader";
import HomeFilter from "./HomeFilter";
import PopularProducts from "./PopularProducts";
import NewArrivals from "./NewArrivals";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HomeHeader />
        <HomeFilter />
        <PopularProducts navigation={navigation} />
        <NewArrivals navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 50,
  },
});
