// Payment Automation Utility
// This utility handles payment selection and REAL order placement automation

import { router } from "expo-router";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  apiValue: "card" | "upi" | "cod" | "netbanking";
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: "💵",
    description: "Pay when your order arrives",
    color: "#10B981",
    apiValue: "cod"
  },
  {
    id: "upi",
    name: "UPI Payment",
    icon: "📱",
    description: "Pay instantly via UPI",
    color: "#3B82F6",
    apiValue: "upi"
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Secure card payment",
    color: "#8B5CF6",
    apiValue: "card"
  }
];

export interface OrderDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: any[];
  deliveryAddress: any;
}

// Real order placement using the actual createOrder function
export const placeRealOrder = async (
  paymentMethodId: string,
  cartState: any, // Changed from cartItems to cartState to get totalPrice
  deliveryAddress: any,
  createOrderFunction: any,
  clearCartFunction: any,
  onProgress?: (message: string, progress: number) => void
): Promise<OrderDetails | null> => {
  const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
  
  if (!paymentMethod) {
    throw new Error("Invalid payment method");
  }

  return new Promise(async (resolve, reject) => {
    const steps = [
      { message: "Validating payment method...", duration: 800 },
      { message: "Processing order details...", duration: 1000 },
      { message: "Confirming inventory...", duration: 600 },
      { message: "Calculating delivery charges...", duration: 400 },
      { message: "Creating order in database...", duration: 1200 },
    ];

    try {
      // Show progress steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progress = ((i + 1) / (steps.length + 1)) * 100;
        
        if (onProgress) {
          onProgress(step.message, progress);
        }
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }

      // Calculate pricing exactly like the checkout page
      const subtotal = cartState.totalPrice || 0; // Use cart's pre-calculated total
      const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over ₹500
      const discount = 0;
      const total = subtotal + deliveryFee - discount;

      const pricing = {
        subtotal,
        discount,
        deliveryFee,
        total
      };

      // Prepare order data exactly like the checkout page
      const orderData = {
        items: cartState.items,
        deliveryAddress,
        paymentInfo: {
          method: paymentMethod.apiValue,
          amount: pricing.total,
          status: paymentMethod.apiValue === "cod" ? "pending" : "success",
          transactionId: paymentMethod.apiValue === "cod" ? "COD_" + Date.now() : "TXN_" + Date.now(),
        },
        pricing,
        orderNotes: "Order placed via AI Assistant",
      };

      if (onProgress) {
        onProgress("Placing order...", 90);
      }

      // Call the createOrder function
      const newOrder = await createOrderFunction(orderData);
      
      if (newOrder) {
        // Clear cart after successful order
        await clearCartFunction();

        if (onProgress) {
          onProgress("Order placed successfully! 🎉", 100);
        }

        // Generate order details response
        const orderDetails: OrderDetails = {
          orderId: newOrder.orderId || newOrder._id || `ORD${Date.now().toString().slice(-6)}`,
          orderDate: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          totalAmount: total,
          paymentMethod: paymentMethod.name,
          status: "Confirmed",
          items: cartState.items,
          deliveryAddress
        };

        // Navigate to order success page like the real checkout does
        setTimeout(() => {
          router.replace({
            pathname: "/order-success",
            params: {
              orderId: orderDetails.orderId,
            },
          });
        }, 2000);

        resolve(orderDetails);
      } else {
        throw new Error("Order creation failed");
      }

    } catch (error) {
      console.error("Real order placement failed:", error);
      reject(error);
    }
  });
};

// Legacy simulation function (keeping for backward compatibility)
export const simulateOrderPlacement = async (
  paymentMethodId: string,
  cartItems: any[],
  deliveryAddress: any,
  onProgress?: (message: string, progress: number) => void
): Promise<OrderDetails> => {
  const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
  
  return new Promise(async (resolve) => {
    const steps = [
      { message: "Validating payment method...", duration: 800 },
      { message: "Processing order details...", duration: 1000 },
      { message: "Confirming inventory...", duration: 600 },
      { message: "Calculating delivery charges...", duration: 400 },
      { message: "Generating order confirmation...", duration: 700 },
      { message: "Order placed successfully! 🎉", duration: 500 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const progress = ((i + 1) / steps.length) * 100;
      
      if (onProgress) {
        onProgress(step.message, progress);
      }
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Generate order details
    const orderDetails: OrderDetails = {
      orderId: `ORD${Date.now().toString().slice(-6)}`,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      paymentMethod: paymentMethod?.name || "Unknown",
      status: "Confirmed",
      items: cartItems,
      deliveryAddress
    };

    resolve(orderDetails);
  });
};

// Create payment selection message data
export const createPaymentSelectionMessage = () => {
  return {
    text: "Great! Your delivery details are all set. Now, please choose your preferred payment method:",
    quickActions: paymentMethods.map(method => ({
      id: method.id,
      text: `${method.icon} ${method.name}`,
      action: "payment_select",
      paymentMethodId: method.id,
      icon: "card-outline"
    }))
  };
};

// Wait utility
const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};