// Global Automation Manager
// Handles communication between chatbot and checkout automation

interface GlobalChatbotContextType {
  isChatbotVisible: boolean;
  setChatbotVisible: (visible: boolean) => void;
  isMinimized: boolean;
  setMinimized: (minimized: boolean) => void;
  setRestoreFunction: (fn: () => void) => void;
}

interface AutomationManager {
  restoreChatbot: (() => void) | null;
  isAutomationActive: boolean;
  globalChatbotContext: GlobalChatbotContextType | null;
  setRestoreFunction: (fn: () => void) => void;
  triggerRestore: () => void;
  startAutomation: () => void;
  stopAutomation: () => void;
  setGlobalContext: (context: GlobalChatbotContextType) => void;
}

class AutomationManagerImpl implements AutomationManager {
  restoreChatbot: (() => void) | null = null;
  isAutomationActive: boolean = false;
  globalChatbotContext: GlobalChatbotContextType | null = null;

  setGlobalContext(context: GlobalChatbotContextType) {
    this.globalChatbotContext = context;
  }

  setRestoreFunction(fn: () => void) {
    this.restoreChatbot = fn;
  }

  triggerRestore() {
    if (this.restoreChatbot) {
      this.restoreChatbot();
      this.isAutomationActive = false;
    }
    // Also restore the global chatbot if context is available
    if (this.globalChatbotContext) {
      this.globalChatbotContext.setMinimized(false);
    }
  }

  startAutomation() {
    this.isAutomationActive = true;
    // Minimize the global chatbot if context is available
    if (this.globalChatbotContext) {
      this.globalChatbotContext.setMinimized(true);
    }
  }

  stopAutomation() {
    this.isAutomationActive = false;
    // Restore the global chatbot if context is available
    if (this.globalChatbotContext) {
      this.globalChatbotContext.setMinimized(false);
    }
  }
}

// Create singleton instance
export const automationManager = new AutomationManagerImpl();