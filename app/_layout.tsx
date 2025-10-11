import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { CartProvider } from "../src/contexts/CartContext";
import { WishlistProvider } from "../src/contexts/WishlistContext";
import { OrderProvider } from "../src/contexts/OrderContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{ headerShown: false }}
            />
          </Stack>
          <Toast />
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
