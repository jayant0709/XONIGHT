// Global Automation Manager
// Handles communication between chatbot and checkout automation

interface AutomationManager {
  restoreChatbot: (() => void) | null;
  isAutomationActive: boolean;
  setRestoreFunction: (fn: () => void) => void;
  triggerRestore: () => void;
  startAutomation: () => void;
  stopAutomation: () => void;
}

class AutomationManagerImpl implements AutomationManager {
  restoreChatbot: (() => void) | null = null;
  isAutomationActive: boolean = false;

  setRestoreFunction(fn: () => void) {
    this.restoreChatbot = fn;
  }

  triggerRestore() {
    if (this.restoreChatbot) {
      this.restoreChatbot();
      this.isAutomationActive = false;
    }
  }

  startAutomation() {
    this.isAutomationActive = true;
  }

  stopAutomation() {
    this.isAutomationActive = false;
  }
}

// Create singleton instance
export const automationManager = new AutomationManagerImpl();