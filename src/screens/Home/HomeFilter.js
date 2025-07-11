import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";

export default function HomeFilter() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const scaleAnimations = useRef({
    all: new Animated.Value(1),
    women: new Animated.Value(1),
    men: new Animated.Value(1),
  }).current;

  const filters = [
    { id: "all", label: "All", icon: "●" },
    { id: "women", label: "Women", icon: "♀" },
    { id: "men", label: "Men", icon: "♂" },
  ];

  const animateButton = (filterId, toValue) => {
    Animated.spring(scaleAnimations[filterId], {
      toValue,
      useNativeDriver: true,
      tension: 150,
      friction: 7,
    }).start();
  };

  const handleFilterPress = (filterId) => {
    setSelectedFilter(filterId);
    
    // Animate all buttons
    Object.keys(scaleAnimations).forEach(key => {
      if (key === filterId) {
        animateButton(key, 1.05);
        setTimeout(() => animateButton(key, 1), 100);
      } else {
        animateButton(key, 0.95);
        setTimeout(() => animateButton(key, 1), 100);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {filters.map((filter, index) => (
          <Animated.View
            key={filter.id}
            style={[
              styles.filterButtonWrapper,
              { transform: [{ scale: scaleAnimations[filter.id] }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.selectedFilter,
                index === 0 && styles.firstButton,
                index === filters.length - 1 && styles.lastButton,
              ]}
              onPress={() => handleFilterPress(filter.id)}
              activeOpacity={0.8}
            >
              <View style={styles.filterContent}>
                <Text style={[
                  styles.filterIcon,
                  selectedFilter === filter.id && styles.selectedFilterIcon,
                ]}>
                  {filter.icon}
                </Text>
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.selectedFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </View>
              {selectedFilter === filter.id && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      
      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.decorativeDot} />
        <View style={[styles.decorativeDot, styles.decorativeDotDelay]} />
        <View style={[styles.decorativeDot, styles.decorativeDotDelay2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fafafa",
    position: "relative",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  filterButtonWrapper: {
    flex: 1,
  },
  filterButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
    transition: "all 0.3s ease",
  },
  firstButton: {
    marginLeft: 0,
  },
  lastButton: {
    marginRight: 0,
  },
  selectedFilter: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
    color: "#9ca3af",
    fontWeight: "600",
  },
  selectedFilterIcon: {
    color: "#ffffff",
  },
  filterText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  selectedFilterText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  selectedIndicator: {
    position: "absolute",
    bottom: 4,
    left: "50%",
    transform: [{ translateX: -8 }],
    width: 16,
    height: 3,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    opacity: 0.8,
  },
  decorativeContainer: {
    position: "absolute",
    top: 8,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  decorativeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 2,
  },
  decorativeDotDelay: {
    backgroundColor: "#d1d5db",
  },
  decorativeDotDelay2: {
    backgroundColor: "#9ca3af",
  },
});