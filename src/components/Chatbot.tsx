import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import theme from "../constants/theme";
import api from "../services/api";
import { useGlobalChatbot } from "../contexts/GlobalChatbotContext";
import { useCart } from "../contexts/CartContext";
import { useOrders } from "../contexts/OrderContext";
import {
  createPaymentSelectionMessage,
  placeRealOrder,
  paymentMethods,
} from "../utils/paymentAutomation";
import { automationManager } from "../utils/automationManager";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  product?: {
    _id: string;
    sku: string;
    name: string;
    price: number;
    images: string[];
    categories: string[];
    description: string;
    stock: number;
    status: string;
    brand?: string;
    attributes?: {
      brand?: string;
      color?: string;
      [key: string]: any;
    };
  };
  isTyping?: boolean;
  quickActions?: Array<{
    id: string;
    text: string;
    action: string;
    icon?: string;
    paymentMethodId?: string;
    orderId?: string;
  }>;
}

interface ChatbotProps {
  isVisible: boolean;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
  onMinimize?: () => void;
  onStartAutomation?: () => void;
  onRestoreChatbot?: (restoreFunction: () => void) => void;
}

const { width, height } = Dimensions.get("window");

const Chatbot: React.FC<ChatbotProps> = ({
  isVisible,
  onClose,
  onAddToCart,
  onMinimize,
  onStartAutomation,
  onRestoreChatbot,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Get cart context for order details
  const { state: cartState, clearCart } = useCart();
  const { createOrder } = useOrders();

  // Use global chatbot context
  const {
    isMinimized,
    setMinimized,
    automationProgress,
    automationPercentage,
  } = useGlobalChatbot();

  // Storage keys
  const CHAT_STORAGE_KEY = "@chatbot_messages";

  // Default welcome message
  const getDefaultMessage = (): Message => ({
    id: "1",
    text: "Hi there! 👋 I'm your personal shopping assistant. I can help you find products, add them to cart, and even complete your purchase! What can I help you with today?",
    isUser: false,
    timestamp: new Date(),
  });

  // Load messages from storage
  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        console.log("Loaded messages:", parsedMessages.length);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } else {
        console.log("No stored messages, using default");
        // First time - set welcome message
        const defaultMessage = getDefaultMessage();
        setMessages([defaultMessage]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      const defaultMessage = getDefaultMessage();
      setMessages([defaultMessage]);
    }
  };

  // Save messages to storage
  const saveMessages = async (newMessages: Message[]) => {
    try {
      console.log("Saving messages:", newMessages.length);
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  // Clear all chat messages
  const clearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all chat messages?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            const defaultMessage = getDefaultMessage();
            setMessages([defaultMessage]);
            saveMessages([defaultMessage]);
          },
        },
      ]
    );
  };

  // Load messages when component mounts
  useEffect(() => {
    loadMessages();
  }, []);

  // Save messages whenever they change (backup save)
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Function to fetch Louis Philippe jeans from backend
  const fetchLouisPhilippeJeans = async () => {
    try {
      const response = await api.get("/api/products/68ebfbc3f183fdbc35c9d28f");
      if (response.data && response.data.product) {
        return response.data.product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addMessage = (
    text: string,
    isUser: boolean,
    product?: any,
    quickActions?: Array<{
      id: string;
      text: string;
      action: string;
      icon?: string;
      paymentMethodId?: string;
      orderId?: string;
    }>
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      product,
      quickActions,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });
    scrollToBottom();
  };

  // Function to trigger payment selection after checkout automation
  const triggerPaymentSelection = useCallback(() => {
    setTimeout(() => {
      setMinimized(false);
      const paymentMessage = createPaymentSelectionMessage();
      addMessage(
        paymentMessage.text,
        false,
        undefined,
        paymentMessage.quickActions
      );
    }, 1000);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");

    // Add user message
    addMessage(userMessage, true);

    // Show typing indicator
    setIsTyping(true);

    // Simulate processing time
    setTimeout(async () => {
      setIsTyping(false);
      await handleBotResponse(userMessage);
    }, 1500);
  };

  const handleBotResponse = async (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("pants") || lowerMessage.includes("jeans")) {
      // Show thinking message
      addMessage(
        "Let me check what we have in premium denim for you... 🤔",
        false
      );

      // Fetch the actual product from backend
      const product = await fetchLouisPhilippeJeans();

      setTimeout(() => {
        if (product) {
          addMessage(
            "Perfect! I'd recommend this premium piece:",
            false,
            product
          );
        } else {
          addMessage(
            "I'm having trouble accessing our inventory right now. Let me try again in a moment!",
            false
          );
        }
      }, 1000);
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      addMessage(
        "Hello! 👋 I'm here to help you shop. Try asking me about pants, or any other product you're looking for!",
        false
      );
    } else if (lowerMessage.includes("help")) {
      addMessage(
        "I can help you with:\n• Finding products\n• Adding items to cart\n• Product recommendations\n• Checkout process\n\nJust ask me anything! For example, try 'show me pants'",
        false
      );
    } else {
      addMessage(
        "I'm working on expanding my knowledge! For now, try asking me about 'pants' and I'll show you our featured product. More categories coming soon! 🚀",
        false
      );
    }
  };

  const handleQuickAction = (quickAction: any) => {
    const action = quickAction.action || quickAction; // Support both object and string

    // Add user message showing their choice
    addMessage(`${getActionDisplayText(action)}`, true);

    // Show typing indicator
    setIsTyping(true);

    // Handle the action
    setTimeout(() => {
      setIsTyping(false);

      switch (action) {
        case "checkout":
          addMessage(
            "Perfect! I'll minimize myself and help you fill out the checkout form automatically. Watch the magic! ✨",
            false
          );
          setTimeout(() => {
            // Minimize the chatbot and start automation
            setMinimized(true);
            router.push("/checkout");
            if (onStartAutomation) {
              onStartAutomation();
            }
          }, 1500);
          break;

        case "view_cart":
          addMessage(
            "Taking you to your cart where you can review all your selected items! 👀",
            false
          );
          setTimeout(() => {
            onClose();
            router.push("/cart");
          }, 1000);
          break;

        case "more_products":
          addMessage(
            "Great choice! I can help you find more amazing products. Try asking me about pants, shirts, or any other category you're interested in! 🛍️",
            false
          );
          break;

        case "similar_items":
          addMessage(
            "I'd love to show you similar items! This feature is coming soon. For now, try asking me about specific product categories like 'pants' or 'jeans' to see our featured items! ✨",
            false
          );
          break;

        case "payment_select":
          const paymentMethodId = quickAction.paymentMethodId;
          const selectedMethod = paymentMethods.find(
            (pm) => pm.id === paymentMethodId
          );

          if (selectedMethod) {
            addMessage(
              `Excellent choice! Processing your order with ${selectedMethod.name}... 🎉`,
              false
            );

            // Start payment automation
            setTimeout(async () => {
              setMinimized(true);
              automationManager.startPaymentFlow();

              try {
                const orderDetails = await placeRealOrder(
                  paymentMethodId,
                  cartState, // Pass entire cart state instead of just items
                  {
                    fullName: "Jayant Patil",
                    phone: "8261961156",
                    email: "jayantpatil07092003@gmail.com",
                    address: "Vihani Residency, Shankar Nagar",
                    city: "Aurangabad",
                    state: "Maharashtra",
                    pincode: "431001",
                  }, // Use the automated delivery address
                  createOrder, // Real order creation function
                  clearCart, // Real cart clearing function
                  (message: string, progress: number) => {
                    automationManager.updatePaymentProgress(message, progress);
                  }
                );

                // Show order confirmation
                if (orderDetails) {
                  setTimeout(() => {
                    setMinimized(false);
                    automationManager.stopAutomation();
                    automationManager.resetAutomation();

                    addMessage(
                      `🎊 ORDER CONFIRMED! 🎊\n\n` +
                        `Order ID: ${orderDetails.orderId}\n` +
                        `Total: ₹${orderDetails.totalAmount}\n` +
                        `Payment: ${orderDetails.paymentMethod}\n` +
                        `Delivery: ${orderDetails.estimatedDelivery}\n\n` +
                        `Your order has been successfully placed! What would you like to do next? 📦✨`,
                      false,
                      undefined,
                      [
                        {
                          id: "track_order",
                          text: "📍 Track My Order",
                          action: "track_order",
                          orderId: orderDetails.orderId,
                        },
                        {
                          id: "shop_more",
                          text: "�️ Continue Shopping",
                          action: "shop_more",
                        },
                      ]
                    );
                  }, 1000);
                } else {
                  throw new Error("Order creation returned null");
                }
              } catch (error) {
                console.error("Order placement failed:", error);
                setMinimized(false);
                automationManager.stopAutomation();
                automationManager.resetAutomation();
                addMessage(
                  "Sorry, there was an issue placing your order in our system. Please try again or contact support. The error has been logged.",
                  false
                );
              }
            }, 1500);
          }
          break;

        case "track_order":
          const orderId = quickAction.orderId;
          if (orderId) {
            addMessage(
              `Taking you to track your order! You'll see real-time delivery status and all order details. 📦📍`,
              false
            );
            setTimeout(() => {
              onClose();
              router.push(`/track-order?orderId=${orderId}`);
            }, 1000);
          } else {
            addMessage(
              "Taking you to track your orders! You can see all your order details and delivery status there. 📦",
              false
            );
            setTimeout(() => {
              onClose();
              router.push("/orders");
            }, 1000);
          }
          break;

        case "shop_more":
          addMessage(
            "Great! Let me take you back to continue shopping. Discover more amazing products! 🛍️",
            false
          );
          setTimeout(() => {
            onClose();
            router.push("/home");
          }, 1000);
          break;

        default:
          addMessage(
            "I'm not sure what you'd like to do. How can I help you today?",
            false
          );
      }
    }, 1000);
  };

  const getActionDisplayText = (action: string): string => {
    switch (action) {
      case "checkout":
        return "Take me to checkout";
      case "view_cart":
        return "Show me my cart";
      case "more_products":
        return "I want to see more products";
      case "similar_items":
        return "Show me similar items";
      case "payment_select":
        return "I'll pay with this method";
      case "track_order":
        return "Track my order";
      case "shop_more":
        return "Continue shopping";
      default:
        return "Continue shopping";
    }
  };

  const restoreFromMinimized = useCallback(() => {
    setMinimized(false);
    // Trigger payment selection after checkout automation completes
    triggerPaymentSelection();
  }, [triggerPaymentSelection]);

  // Pass restore function to parent component
  useEffect(() => {
    if (onRestoreChatbot) {
      onRestoreChatbot(restoreFromMinimized);
    }
  }, [onRestoreChatbot, restoreFromMinimized]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: automationPercentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [automationPercentage, progressAnimation]);

  // Scroll to bottom when chatbot becomes visible
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 10); // Slight delay to ensure UI is ready
    }
  }, [isVisible]);

  const handleAddToCart = (product: any) => {
    if (onAddToCart) {
      onAddToCart(product);
    }

    // Create quick action buttons for post-cart actions
    const quickActions = [
      {
        id: "checkout",
        text: "🛒 Checkout Now",
        action: "checkout",
        icon: "card-outline",
      },
      {
        id: "view_cart",
        text: "👀 View Cart",
        action: "view_cart",
        icon: "bag-outline",
      },
    ];

    addMessage(
      `✅ Added "${product.name}" to your cart! What would you like to do next?`,
      false,
      undefined,
      quickActions
    );
  };

  const renderMessage = (message: Message) => {
    if (message.isUser) {
      return (
        <View key={message.id} style={styles.userMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{message.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={message.id} style={styles.botMessageContainer}>
        <View style={styles.botAvatar}>
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color={theme.colors.white}
          />
        </View>
        <View style={styles.botMessage}>
          <Text style={styles.botMessageText}>{message.text}</Text>

          {message.product && (
            <View style={styles.productCard}>
              <Image
                source={{
                  uri:
                    message.product.images && message.product.images.length > 0
                      ? message.product.images[0].startsWith("data:")
                        ? message.product.images[0]
                        : `data:image/jpeg;base64,${message.product.images[0]}`
                      : "https://via.placeholder.com/300x200?text=No+Image",
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>
                  {message.product.brand ||
                    message.product.attributes?.brand ||
                    "Premium Brand"}
                </Text>
                <Text style={styles.productName}>{message.product.name}</Text>
                <Text style={styles.productPrice}>
                  ₹{message.product.price}
                </Text>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => handleAddToCart(message.product)}
                  >
                    <Ionicons
                      name="basket-outline"
                      size={16}
                      color={theme.colors.white}
                    />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewProductBtn}
                    onPress={() => {
                      if (message.product) {
                        onClose();
                        router.push(`/product/${message.product._id}`);
                      }
                    }}
                  >
                    <Text style={styles.viewProductText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {message.quickActions && message.quickActions.length > 0 && (
            <View style={styles.quickActionsContainer}>
              {message.quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action)}
                >
                  <Text style={styles.quickActionText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.botMessageContainer}>
        <View style={styles.botAvatar}>
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color={theme.colors.white}
          />
        </View>
        <View style={styles.typingContainer}>
          <Animated.View
            style={[styles.typingDot, { opacity: typingAnimation }]}
          />
          <Animated.View
            style={[styles.typingDot, { opacity: typingAnimation }]}
          />
          <Animated.View
            style={[styles.typingDot, { opacity: typingAnimation }]}
          />
        </View>
      </View>
    );
  };

  // Render minimized chatbot bar
  if (isMinimized) {
    return (
      <Modal
        visible={isVisible}
        animationType="none"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.minimizedContainer}>
          <TouchableOpacity
            style={styles.minimizedBar}
            onPress={restoreFromMinimized}
          >
            <View style={styles.minimizedContent}>
              <View style={styles.minimizedIcon}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color={theme.colors.white}
                />
                {automationPercentage > 0 && (
                  <View style={styles.workingIndicator}>
                    <Ionicons
                      name="create-outline"
                      size={10}
                      color={theme.colors.primary[500]}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.minimizedText}>
                {automationProgress || "🤖 Tap to open chat"}
              </Text>
              <View style={styles.percentageContainer}>
                {automationPercentage > 0 && (
                  <Text style={styles.percentageText}>
                    {Math.round(automationPercentage)}%
                  </Text>
                )}
                <Ionicons
                  name="chevron-up"
                  size={14}
                  color="white"
                  opacity={0.8}
                />
              </View>
            </View>

            {/* Progress Bar - positioned at bottom of the minimized bar */}
            {automationPercentage > 0 && (
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "android" ? (isKeyboardVisible ? 30 : 0) : 0
        }
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Shopping Assistant</Text>
            <Text style={styles.headerSubtitle}>Online • Ready to help</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.white}
              />
            </TouchableOpacity>

            <View style={styles.headerAvatar}>
              <Ionicons
                name="chatbubble-ellipses"
                size={18} // Reduced from 24 to 18
                color={theme.colors.white}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {renderTypingIndicator()}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.gray[400]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : null,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() ? theme.colors.white : theme.colors.gray[400]
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md, // Reduced from lg to md
    paddingTop: theme.spacing.lg + 10, // Reduced from xl + 20 to lg + 10
    ...theme.shadows.medium,
  },
  closeButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.base, // Reduced from lg to base
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.xs, // Reduced from sm to xs
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  clearButton: {
    padding: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerAvatar: {
    width: 32, // Reduced from 40 to 32
    height: 32, // Reduced from 40 to 32
    borderRadius: theme.borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.md,
  },
  userMessage: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    maxWidth: "80%",
  },
  userMessageText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
  },
  botMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  botMessage: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    maxWidth: "80%",
    ...theme.shadows.small,
  },
  botMessageText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.sizes.base,
    lineHeight: 20,
  },
  productCard: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productBrand: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weights.semibold,
    textTransform: "uppercase",
    marginBottom: theme.spacing.xs,
  },
  productName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.md,
  },
  productActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  Ionicons: {
    marginLeft: theme.spacing.sm,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    textAlign: "center",
    flex: 1,
  },
  viewProductBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minHeight: 44,
  },
  viewProductText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    textAlign: "center",
  },
  typingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    ...theme.shadows.small,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray[400],
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gray[800],
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  quickActionsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  quickActionButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    flex: 1,
    minWidth: "45%",
  },
  quickActionText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    textAlign: "center",
  },
  // Minimized chatbot styles
  minimizedContainer: {
    position: "absolute",
    bottom: 100, // Above navigation bar
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
  },
  minimizedBar: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.medium,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  minimizedIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  minimizedText: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  minimizedProgress: {
    width: 30,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: 2,
  },
  progressBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFD700", // Golden color for progress
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  workingIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
  },
  percentageText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
});

export default Chatbot;
