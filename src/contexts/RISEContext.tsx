import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface RISEContextType {
  currentPage: string;
  pageData: Record<string, any>;
  chatHistory: Array<{ role: string; content: string }>;
  setCurrentPage: (page: string) => void;
  setPageData: (data: Record<string, any>) => void;
  setChatHistory: (history: Array<{ role: string; content: string }>) => void;
}

const RISEContext = createContext<RISEContextType>({
  currentPage: "dashboard",
  pageData: {},
  chatHistory: [],
  setCurrentPage: () => {},
  setPageData: () => {},
  setChatHistory: () => {},
});

export const useRISEContext = () => useContext(RISEContext);

export const RISEContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageData, setPageDataState] = useState<Record<string, any>>({});
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  const setPageData = useCallback((data: Record<string, any>) => {
    setPageDataState(prev => ({ ...prev, ...data }));
  }, []);

  return (
    <RISEContext.Provider value={{ currentPage, pageData, chatHistory, setCurrentPage, setPageData, setChatHistory }}>
      {children}
    </RISEContext.Provider>
  );
};
