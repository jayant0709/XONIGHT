import React, { createContext, useContext, useState, ReactNode } from "react";

interface GlobalChatbotContextType {
  isChatbotVisible: boolean;
  setChatbotVisible: (visible: boolean) => void;
  isMinimized: boolean;
  setMinimized: (minimized: boolean) => void;
  restoreFunction: (() => void) | null;
  setRestoreFunction: (fn: (() => void) | null) => void;
  automationProgress: string;
  setAutomationProgress: (progress: string) => void;
  automationPercentage: number;
  setAutomationPercentage: (percentage: number) => void;
}

const GlobalChatbotContext = createContext<
  GlobalChatbotContextType | undefined
>(undefined);

interface GlobalChatbotProviderProps {
  children: ReactNode;
}

export const GlobalChatbotProvider: React.FC<GlobalChatbotProviderProps> = ({
  children,
}) => {
  const [isChatbotVisible, setChatbotVisible] = useState(false);
  const [isMinimized, setMinimized] = useState(false);
  const [restoreFunction, setRestoreFunction] = useState<(() => void) | null>(
    null
  );
  const [automationProgress, setAutomationProgress] = useState("");
  const [automationPercentage, setAutomationPercentage] = useState(0);

  return (
    <GlobalChatbotContext.Provider
      value={{
        isChatbotVisible,
        setChatbotVisible,
        isMinimized,
        setMinimized,
        restoreFunction,
        setRestoreFunction,
        automationProgress,
        setAutomationProgress,
        automationPercentage,
        setAutomationPercentage,
      }}
    >
      {children}
    </GlobalChatbotContext.Provider>
  );
};

export const useGlobalChatbot = () => {
  const context = useContext(GlobalChatbotContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalChatbot must be used within a GlobalChatbotProvider"
    );
  }
  return context;
};
