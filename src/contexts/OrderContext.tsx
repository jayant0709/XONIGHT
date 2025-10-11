import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// Order interfaces matching the web app structure
export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  attributes: any;
  image: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface PaymentInfo {
  method: "card" | "upi" | "cod" | "netbanking";
  status: "success" | "pending" | "failed";
  transactionId: string;
  amount: number;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface OrderTimeline {
  stage: string;
  timestamp: Date;
  description: string;
}

export interface Order {
  _id?: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentInfo: PaymentInfo;
  pricing: OrderPricing;
  status: string;
  timeline: OrderTimeline[];
  estimatedDelivery: Date;
  orderNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

type OrderAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "LOAD_ORDERS"; payload: Order[] }
  | { type: "SET_CURRENT_ORDER"; payload: Order | null }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: Order };

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  loadOrders: () => Promise<void>;
  createOrder: (orderData: {
    items: any[];
    deliveryAddress: DeliveryAddress;
    paymentInfo: PaymentInfo;
    orderNotes?: string;
    pricing: OrderPricing;
  }) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  refreshOrders: () => Promise<void>;
} | null>(null);

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "LOAD_ORDERS":
      return {
        ...state,
        orders: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_CURRENT_ORDER":
      return { ...state, currentOrder: action.payload };

    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload,
      };

    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.orderId === action.payload.orderId ? action.payload : order
        ),
        currentOrder:
          state.currentOrder?.orderId === action.payload.orderId
            ? action.payload
            : state.currentOrder,
      };

    default:
      return state;
  }
};

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load all orders for the user
  const loadOrders = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("🔄 [OrderContext] Loading orders...");

      const token = await AsyncStorage.getItem("auth-token");
      if (!token) {
        console.log("⚠️ [OrderContext] No auth token found");
        dispatch({ type: "LOAD_ORDERS", payload: [] });
        return;
      }

      const response = await api.get("/api/orders");
      const data = response.data;

      if (data.ok) {
        console.log("✅ [OrderContext] Loaded", data.orders.length, "orders");
        // Parse dates from API response
        const ordersWithParsedDates = data.orders.map((order: any) => ({
          ...order,
          createdAt:
            typeof order.createdAt === "string"
              ? new Date(order.createdAt)
              : order.createdAt,
          updatedAt:
            typeof order.updatedAt === "string"
              ? new Date(order.updatedAt)
              : order.updatedAt,
          estimatedDelivery:
            typeof order.estimatedDelivery === "string"
              ? new Date(order.estimatedDelivery)
              : order.estimatedDelivery,
          timeline:
            order.timeline?.map((item: any) => ({
              ...item,
              timestamp:
                typeof item.timestamp === "string"
                  ? new Date(item.timestamp)
                  : item.timestamp,
            })) || [],
        }));
        dispatch({ type: "LOAD_ORDERS", payload: ordersWithParsedDates });
      } else {
        console.error("❌ [OrderContext] Failed to load orders:", data.error);
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      console.error("❌ [OrderContext] Error loading orders:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load orders" });
    }
  }, []);

  // Create a new order
  const createOrder = useCallback(
    async (orderData: {
      items: any[];
      deliveryAddress: DeliveryAddress;
      paymentInfo: PaymentInfo;
      orderNotes?: string;
      pricing: OrderPricing;
    }): Promise<Order> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        console.log("🔄 [OrderContext] Creating order...");

        const response = await api.post("/api/orders", orderData);
        const data = response.data;

        if (data.ok) {
          console.log("✅ [OrderContext] Order created:", data.orderId);
          // Parse dates from API response
          const orderWithParsedDates = {
            ...data.order,
            createdAt:
              typeof data.order.createdAt === "string"
                ? new Date(data.order.createdAt)
                : data.order.createdAt,
            updatedAt:
              typeof data.order.updatedAt === "string"
                ? new Date(data.order.updatedAt)
                : data.order.updatedAt,
            estimatedDelivery:
              typeof data.order.estimatedDelivery === "string"
                ? new Date(data.order.estimatedDelivery)
                : data.order.estimatedDelivery,
            timeline:
              data.order.timeline?.map((item: any) => ({
                ...item,
                timestamp:
                  typeof item.timestamp === "string"
                    ? new Date(item.timestamp)
                    : item.timestamp,
              })) || [],
          };
          dispatch({ type: "ADD_ORDER", payload: orderWithParsedDates });
          return orderWithParsedDates;
        } else {
          console.error(
            "❌ [OrderContext] Failed to create order:",
            data.error
          );
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("❌ [OrderContext] Error creating order:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create order" });
        throw error;
      }
    },
    []
  );

  // Get order by ID
  const getOrderById = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        console.log("🔄 [OrderContext] Getting order:", orderId);

        const response = await api.get(`/api/orders/${orderId}`);
        const data = response.data;

        if (data.ok) {
          console.log("✅ [OrderContext] Got order:", orderId);
          // Parse dates from API response
          const orderWithParsedDates = {
            ...data.order,
            createdAt:
              typeof data.order.createdAt === "string"
                ? new Date(data.order.createdAt)
                : data.order.createdAt,
            updatedAt:
              typeof data.order.updatedAt === "string"
                ? new Date(data.order.updatedAt)
                : data.order.updatedAt,
            estimatedDelivery:
              typeof data.order.estimatedDelivery === "string"
                ? new Date(data.order.estimatedDelivery)
                : data.order.estimatedDelivery,
            timeline:
              data.order.timeline?.map((item: any) => ({
                ...item,
                timestamp:
                  typeof item.timestamp === "string"
                    ? new Date(item.timestamp)
                    : item.timestamp,
              })) || [],
          };
          dispatch({
            type: "SET_CURRENT_ORDER",
            payload: orderWithParsedDates,
          });
          return orderWithParsedDates;
        } else {
          console.error("❌ [OrderContext] Order not found:", data.error);
          return null;
        }
      } catch (error: any) {
        console.error("❌ [OrderContext] Error getting order:", error);
        // Check if it's a 404 error
        if (error.response?.status === 404) {
          console.log("⚠️ [OrderContext] Order not found (404)");
        }
        return null;
      }
    },
    []
  );

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    console.log("🔄 [OrderContext] Refreshing orders...");
    await loadOrders();
  }, [loadOrders]);

  return (
    <OrderContext.Provider
      value={{
        state,
        dispatch,
        loadOrders,
        createOrder,
        getOrderById,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

export default OrderContext;
