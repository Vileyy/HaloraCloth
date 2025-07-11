import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  Alert
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      "Thêm vào giỏ hàng",
      `Đã thêm ${quantity} ${product.name} vào giỏ hàng`,
      [{ text: "OK" }]
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      "Mua ngay",
      `Đặt mua ${quantity} ${product.name}`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xác nhận", onPress: () => console.log("Đặt hàng thành công") }
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={i} style={styles.star}>★</Text>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.starHalf}>★</Text>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.starEmpty}>★</Text>
      );
    }

    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header với nút yêu thích */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Text style={[styles.favoriteIcon, { color: isFavorite ? '#e74c3c' : '#bdc3c7' }]}>
              ♥
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.image} />
          {product.originalPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.productInfo}>
          <Text style={styles.name}>{product.name}</Text>
          
          {/* Đánh giá */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(product.rating)}
            </View>
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviews} đánh giá)
            </Text>
          </View>

          {/* Giá */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </Text>
            )}
          </View>

          {/* Mô tả */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Chọn số lượng */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={() => handleQuantityChange('decrease')}
                disabled={quantity === 1}
              >
                <Text style={[styles.quantityButtonText, quantity === 1 && styles.quantityButtonTextDisabled]}>
                  −
                </Text>
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange('increase')}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Nút hành động */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowGradient}
          >
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  image: {
    width: width - 80,
    height: width - 80,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  productInfo: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    marginTop: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 16,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
    color: '#f39c12',
    marginRight: 2,
  },
  starHalf: {
    fontSize: 16,
    color: '#f39c12',
    marginRight: 2,
    opacity: 0.7,
  },
  starEmpty: {
    fontSize: 16,
    color: '#e0e0e0',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#27ae60',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#5a6c7d',
    lineHeight: 24,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quantityButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  quantityButtonTextDisabled: {
    color: '#bdc3c7',
  },
  quantityDisplay: {
    backgroundColor: '#f8f9fc',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8ecf4',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8ecf4',
  },
  addToCartButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ecf0f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  buyNowButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyNowGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});