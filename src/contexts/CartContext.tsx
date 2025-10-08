import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  images: string[];
  categories: string[];
  category?: string;
  description: string;
  stock: number;
  status: string;
  brand?: string;
  attributes?: {
    brand?: string;
    color?: string;
    [key: string]: any;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedAttributes?: { [key: string]: string };
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: {
        product: Product;
        quantity?: number;
        attributes?: { [key: string]: string };
      };
    }
  | { type: "REMOVE_FROM_CART"; payload: { productId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (
    product: Product,
    quantity?: number,
    attributes?: { [key: string]: string }
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity = 1, attributes = {} } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product._id === product._id &&
          JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { product, quantity, selectedAttributes: attributes },
        ];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter(
        (item) => item.product._id !== action.payload.productId
      );
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      const newItems = state.items
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case "LOAD_CART": {
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items,
        totalItems,
        totalPrice,
      };
    }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

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

  // Function to refresh cart from API
  const refreshCartFromAPI = async () => {
    try {
      const token = await AsyncStorage.getItem("auth-token");
      if (!token) {
        console.log("⚠️ [CartContext] No auth token found, skipping refresh");
        return;
      }

      console.log("🔄 [CartContext] Refreshing cart from API...");
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await api.get("/api/cart");
      const data = response.data;

      if (data.ok) {
        // Handle both empty carts and carts with items
        const cartItems = Array.isArray(data.cart) ? data.cart : [];
        console.log(
          "✅ [CartContext] Refreshed cart with",
          cartItems.length,
          "items"
        );

        // Always dispatch LOAD_CART even if empty to clear the cart
        dispatch({ type: "LOAD_CART", payload: cartItems });

        // Update local storage backup
        const userId = await getUserId();
        if (userId) {
          await AsyncStorage.setItem(
            `cart_${userId}`,
            JSON.stringify(cartItems)
          );
        }
      } else {
        console.log("⚠️ [CartContext] API returned error:", data.error);
        // If API returns error, don't modify the cart state
      }
    } catch (error) {
      console.error("❌ [CartContext] Error refreshing cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load cart from API and AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        console.log("🔄 [CartContext] Loading cart...");
        dispatch({ type: "SET_LOADING", payload: true });

        // First try to load from API (if user is logged in)
        const token = await AsyncStorage.getItem("auth-token");

        if (token) {
          const userId = await getUserId();
          console.log("👤 [CartContext] User ID:", userId);

          try {
            const response = await api.get("/api/cart");
            const data = response.data;

            if (data.ok && Array.isArray(data.cart)) {
              console.log(
                "✅ [CartContext] Loading cart from API with",
                data.cart.length,
                "items"
              );
              dispatch({ type: "LOAD_CART", payload: data.cart });

              // Save to user-specific AsyncStorage as backup
              if (userId) {
                await AsyncStorage.setItem(
                  `cart_${userId}`,
                  JSON.stringify(data.cart)
                );
              }
              return;
            }
          } catch (apiError) {
            console.error("❌ [CartContext] API Error:", apiError);
          }

          // If API fails, try user-specific AsyncStorage
          if (userId) {
            const savedCart = await AsyncStorage.getItem(`cart_${userId}`);
            if (savedCart) {
              const cartItems = JSON.parse(savedCart);
              console.log(
                "✅ Loaded from user AsyncStorage:",
                cartItems.length,
                "items"
              );
              dispatch({ type: "LOAD_CART", payload: cartItems });
              return;
            }
          }
        }

        // Fallback to general AsyncStorage
        const savedCart = await AsyncStorage.getItem("cart");
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          console.log(
            "✅ Loaded from general AsyncStorage:",
            cartItems.length,
            "items"
          );
          dispatch({ type: "LOAD_CART", payload: cartItems });
        }
      } catch (error) {
        console.error("❌ Error loading cart:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadCart();
  }, []);

  // Save cart to both API and AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (state.isLoading) return; // Don't save while loading

      console.log(
        "💾 [CartContext] Saving cart with",
        state.items.length,
        "items"
      );

      try {
        const token = await AsyncStorage.getItem("auth-token");

        if (token) {
          const userId = await getUserId();

          // Save to user-specific AsyncStorage
          if (userId) {
            await AsyncStorage.setItem(
              `cart_${userId}`,
              JSON.stringify(state.items)
            );
          }

          // Sync to API
          try {
            await api.post("/api/cart", { items: state.items });
            console.log("✅ [CartContext] Cart synced to API successfully");
          } catch (apiError) {
            console.error(
              "❌ [CartContext] Failed to sync cart to API:",
              apiError
            );
          }
        } else {
          // If not logged in, save to general AsyncStorage
          await AsyncStorage.setItem("cart", JSON.stringify(state.items));
        }
      } catch (error) {
        console.error("❌ Error syncing cart:", error);
        // Fallback to general AsyncStorage
        await AsyncStorage.setItem("cart", JSON.stringify(state.items));
      }
    };

    // Only save if cart has been loaded
    if (state.items.length > 0 || !state.isLoading) {
      saveCart();
    }
  }, [state.items, state.isLoading]);

  const addToCart = (product: Product, quantity = 1, attributes = {}) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity, attributes },
    });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const refreshCart = useCallback(async () => {
    console.log("🔄 [CartContext] Manual cart refresh requested");
    await refreshCartFromAPI();
  }, []);

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
