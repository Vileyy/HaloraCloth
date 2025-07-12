import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import HomeHeader from "./HomeHeader";
import HomeFilter from "./HomeFilter";
import PopularProducts from "./PopularProducts";
import NewArrivals from "./NewArrivals";

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HomeHeader navigation={navigation} onSearchChange={setSearchText} />
        <HomeFilter />
        <PopularProducts navigation={navigation} searchText={searchText} />
        <NewArrivals navigation={navigation} searchText={searchText} />
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
