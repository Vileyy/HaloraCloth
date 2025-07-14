import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToCartDB,
  getCartItemsDB,
  updateCartItemDB,
  removeFromCartDB,
  clearCartDB,
} from "../../services/firebase";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Async 
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const result = await getCartItemsDB(userId);
    if (result.success) {
      return result.items;
    } else {
      throw new Error(result.error);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ userId, product, quantity }) => {
    const result = await addToCartDB(userId, product, quantity);
    if (result.success) {
      return {
        ...product,
        id: result.itemId,
        quantity,
        updated: result.updated,
      };
    } else {
      throw new Error(result.error);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItemAsync",
  async ({ userId, itemId, updates }) => {
    const result = await updateCartItemDB(userId, itemId, updates);
    if (result.success) {
      return { itemId, updates };
    } else {
      throw new Error(result.error);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async ({ userId, itemId }) => {
    const result = await removeFromCartDB(userId, itemId);
    if (result.success) {
      return itemId;
    } else {
      throw new Error(result.error);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (userId) => {
    const result = await clearCartDB(userId);
    if (result.success) {
      return true;
    } else {
      throw new Error(result.error);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      state.items.push(action.payload);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    setCartItems(state, action) {
      state.items = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Check if item already exists and update quantity
        const existingItem = state.items.find(
          (item) => item.id === action.payload.id
        );
        if (existingItem) {
          if (action.payload.updated) {
            existingItem.quantity += action.payload.quantity;
          } else {
            Object.assign(existingItem, action.payload);
          }
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        const item = state.items.find(
          (item) => item.id === action.payload.itemId
        );
        if (item) {
          Object.assign(item, action.payload.updates);
        }
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  setCartItems,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;
