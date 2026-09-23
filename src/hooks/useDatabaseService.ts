import { useEffect, useMemo, useState } from "react";
import { databaseService } from "@/utils/databaseService";

export const useDatabaseService = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = databaseService.subscribe(() => setTick((value) => value + 1));
    return unsubscribe;
  }, []);

  return useMemo(() => databaseService, []);
};
