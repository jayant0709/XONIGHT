import React, { useEffect } from "react";
import { useGlobalChatbot } from "../contexts/GlobalChatbotContext";
import { useCart } from "../contexts/CartContext";
import Chatbot from "./Chatbot";
import ChatbotFloatingButton from "./ChatbotFloatingButton";
import { automationManager } from "../utils/automationManager";

const GlobalChatbot: React.FC = () => {
  const globalChatbotContext = useGlobalChatbot();
  const {
    isChatbotVisible,
    setChatbotVisible,
    isMinimized,
    setMinimized,
    setRestoreFunction,
  } = globalChatbotContext;
  const { addToCart } = useCart();

  // Connect automation manager with global context
  useEffect(() => {
    automationManager.setGlobalContext(globalChatbotContext);
  }, [globalChatbotContext]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1, {
      size: "M", // Default size
      color: "Default", // Default color
    });
  };

  const handleStartAutomation = () => {
    setMinimized(true);
    automationManager.startAutomation();
  };

  const handleRestoreChatbot = (restoreFunction: () => void) => {
    setRestoreFunction(() => restoreFunction);
    automationManager.setRestoreFunction(restoreFunction);
  };

  return (
    <>
      {/* Floating Button - shown when chatbot is not visible and not minimized */}
      {!isChatbotVisible && !isMinimized && (
        <ChatbotFloatingButton onPress={() => setChatbotVisible(true)} />
      )}

      {/* Chatbot Modal */}
      <Chatbot
        isVisible={isChatbotVisible}
        onClose={() => setChatbotVisible(false)}
        onAddToCart={handleAddToCart}
        onStartAutomation={handleStartAutomation}
        onRestoreChatbot={handleRestoreChatbot}
      />
    </>
  );
};

export default GlobalChatbot;
