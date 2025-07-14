import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  saveUserToDB,
  updateUserDB,
  getUserFromDB,
} from "../../services/firebase";

const initialState = {
  userInfo: null,
  userData: null,
  loading: false,
  error: null,
};

// Async thunks
export const saveUserAsync = createAsyncThunk(
  "user/saveUserAsync",
  async (user) => {
    const result = await saveUserToDB(user);
    if (result.success) {
      return user;
    } else {
      throw new Error(result.error);
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  "user/updateUserAsync",
  async ({ userId, updates }) => {
    const result = await updateUserDB(userId, updates);
    if (result.success) {
      return { userId, updates };
    } else {
      throw new Error(result.error);
    }
  }
);

export const fetchUserAsync = createAsyncThunk(
  "user/fetchUserAsync",
  async (userId) => {
    const result = await getUserFromDB(userId);
    if (result.success) {
      return result.user;
    } else {
      throw new Error(result.error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
    setUserData(state, action) {
      state.userData = action.payload;
    },
    clearUserInfo(state) {
      state.userInfo = null;
      state.userData = null;
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
      // Save user
      .addCase(saveUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Chỉ lưu các trường đơn giản
        const user = action.payload;
        state.userInfo = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
        };
      })
      .addCase(saveUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update user
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userInfo) {
          Object.assign(state.userInfo, action.payload.updates);
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch user
      .addCase(fetchUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Chỉ lưu các trường đơn giản
        const user = action.payload;
        state.userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
        };
      })
      .addCase(fetchUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUserInfo, setUserData, clearUserInfo, setLoading, setError } =
  userSlice.actions;
export default userSlice.reducer;
