import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  remove,
  update,
} from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAcnBmyVrwzABRm0FHD_Dw5C4U0ofHdW0k",
  authDomain: "halorashop.firebaseapp.com",
  databaseURL:
    "https://halorashop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "halorashop",
  storageBucket: "halorashop.firebasestorage.app",
  messagingSenderId: "470313202528",
  appId: "1:470313202528:web:21b996672005919663a405",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getDatabase(app);

// Cart functions
export const addToCartDB = async (userId, product, quantity = 1) => {
  try {
    const cartRef = ref(db, `users/${userId}/cart`);
    const snapshot = await get(cartRef);
    let foundItem = null;
    let foundKey = null;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        // So sánh productId, selectedSize, selectedColor
        if (
          item.productId === product.id &&
          (item.selectedSize || null) === (product.selectedSize || null) &&
          (item.selectedColor || 0) === (product.selectedColor || 0)
        ) {
          foundItem = item;
          foundKey = childSnapshot.key;
        }
      });
    }
    if (foundItem && foundKey) {
      // Nếu đã có, tăng số lượng
      const newQuantity = (foundItem.quantity || 1) + quantity;
      await update(ref(db, `users/${userId}/cart/${foundKey}`), {
        quantity: newQuantity,
      });
      return { success: true, itemId: foundKey, updated: true };
    } else {
      // Nếu chưa có, thêm mới
      const newCartItemRef = push(cartRef);
      const cartItem = {
        id: newCartItemRef.key,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        selectedSize: product.selectedSize || null,
        selectedColor: product.selectedColor || 0,
        addedAt: Date.now(),
      };
      await set(newCartItemRef, cartItem);
      return { success: true, itemId: newCartItemRef.key, updated: false };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: error.message };
  }
};

export const getCartItemsDB = async (userId) => {
  try {
    const cartRef = ref(db, `users/${userId}/cart`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      const cartItems = [];
      snapshot.forEach((childSnapshot) => {
        cartItems.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      return { success: true, items: cartItems };
    } else {
      return { success: true, items: [] };
    }
  } catch (error) {
    console.error("Error getting cart items:", error);
    return { success: false, error: error.message };
  }
};

export const updateCartItemDB = async (userId, itemId, updates) => {
  try {
    const itemRef = ref(db, `users/${userId}/cart/${itemId}`);
    await update(itemRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: error.message };
  }
};

export const removeFromCartDB = async (userId, itemId) => {
  try {
    const itemRef = ref(db, `users/${userId}/cart/${itemId}`);
    await remove(itemRef);
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error.message };
  }
};

export const clearCartDB = async (userId) => {
  try {
    const cartRef = ref(db, `users/${userId}/cart`);
    await remove(cartRef);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: error.message };
  }
};

// User functions
export const saveUserToDB = async (user) => {
  try {
    const userRef = ref(db, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL || null,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    await set(userRef, userData);
    return { success: true };
  } catch (error) {
    console.error("Error saving user to DB:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserDB = async (userId, updates) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
};

export const getUserFromDB = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return { success: true, user: snapshot.val() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user from DB:", error);
    return { success: false, error: error.message };
  }
};
