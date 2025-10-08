import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface WishlistState {
  items: string[]; // Array of product IDs
  isLoading: boolean;
}

type WishlistAction =
  | { type: "ADD_TO_WISHLIST"; payload: string }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "LOAD_WISHLIST"; payload: string[] }
  | { type: "CLEAR_WISHLIST" }
  | { type: "SET_LOADING"; payload: boolean };

const WishlistContext = createContext<{
  state: WishlistState;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  refreshWishlist: () => void;
} | null>(null);

const wishlistReducer = (
  state: WishlistState,
  action: WishlistAction
): WishlistState => {
  switch (action.type) {
    case "ADD_TO_WISHLIST":
      if (state.items.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        items: state.items.filter((id) => id !== action.payload),
      };

    case "LOAD_WISHLIST":
      return {
        ...state,
        items: action.payload,
      };

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Helper function to get user ID from token
  const getUserId = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem("auth-token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || null;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  // Load wishlist from AsyncStorage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const token = await AsyncStorage.getItem("auth-token");

        if (token) {
          const userId = await getUserId();
          if (userId) {
            const savedWishlist = await AsyncStorage.getItem(
              `wishlist_${userId}`
            );
            if (savedWishlist) {
              const wishlistItems = JSON.parse(savedWishlist);
              dispatch({ type: "LOAD_WISHLIST", payload: wishlistItems });
            }
          }
        } else {
          // Fallback to general wishlist
          const savedWishlist = await AsyncStorage.getItem("wishlist");
          if (savedWishlist) {
            const wishlistItems = JSON.parse(savedWishlist);
            dispatch({ type: "LOAD_WISHLIST", payload: wishlistItems });
          }
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadWishlist();
  }, []);

  // Save wishlist to AsyncStorage whenever it changes
  useEffect(() => {
    const saveWishlist = async () => {
      if (state.isLoading) return;

      try {
        const token = await AsyncStorage.getItem("auth-token");

        if (token) {
          const userId = await getUserId();
          if (userId) {
            await AsyncStorage.setItem(
              `wishlist_${userId}`,
              JSON.stringify(state.items)
            );
          }
        } else {
          await AsyncStorage.setItem("wishlist", JSON.stringify(state.items));
        }
      } catch (error) {
        console.error("Error saving wishlist:", error);
      }
    };

    if (!state.isLoading) {
      saveWishlist();
    }
  }, [state.items, state.isLoading]);

  const addToWishlist = (productId: string) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: productId });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.items.includes(productId);
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const refreshWishlist = async () => {
    // Reload wishlist from storage
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const token = await AsyncStorage.getItem("auth-token");

      if (token) {
        const userId = await getUserId();
        if (userId) {
          const savedWishlist = await AsyncStorage.getItem(
            `wishlist_${userId}`
          );
          if (savedWishlist) {
            const wishlistItems = JSON.parse(savedWishlist);
            dispatch({ type: "LOAD_WISHLIST", payload: wishlistItems });
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        state,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
