import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { CartProvider } from "../src/contexts/CartContext";
import { WishlistProvider } from "../src/contexts/WishlistContext";
import { OrderProvider } from "../src/contexts/OrderContext";
import { GlobalChatbotProvider } from "../src/contexts/GlobalChatbotContext";
import { toastConfig } from "../src/components/CustomToast";
import GlobalChatbot from "../src/components/GlobalChatbot";

export default function RootLayout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <GlobalChatbotProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[id]"
                options={{ headerShown: false }}
              />
            </Stack>
            <GlobalChatbot />
            <Toast config={toastConfig} />
          </GlobalChatbotProvider>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
