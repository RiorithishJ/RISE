import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface RISEContextType {
  currentPage: string;
  pageData: Record<string, any>;
  setCurrentPage: (page: string) => void;
  setPageData: (data: Record<string, any>) => void;
}

const RISEContext = createContext<RISEContextType>({
  currentPage: "dashboard",
  pageData: {},
  setCurrentPage: () => {},
  setPageData: () => {},
});

export const useRISEContext = () => useContext(RISEContext);

export const RISEContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageData, setPageDataState] = useState<Record<string, any>>({});

  const setPageData = useCallback((data: Record<string, any>) => {
    setPageDataState(prev => ({ ...prev, ...data }));
  }, []);

  return (
    <RISEContext.Provider value={{ currentPage, pageData, setCurrentPage, setPageData }}>
      {children}
    </RISEContext.Provider>
  );
};
