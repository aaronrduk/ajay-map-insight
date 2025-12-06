import { useEffect, useState } from "react";
import { realtimeService } from "@/lib/realtime-service";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeSubscription = (
  tableName: string,
  queryKey: string[],
  filter?: string
) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTable(
      tableName,
      (payload) => {
        queryClient.invalidateQueries({ queryKey });
      },
      filter
    );

    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [tableName, filter, queryClient, ...queryKey]);

  return { isSubscribed };
};

export const useRealtimeGrievances = (userId?: string) => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const filter = userId ? `user_id=eq.${userId}` : undefined;
    const unsubscribe = realtimeService.subscribeToGrievances(
      userId,
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["grievances"] });
        queryClient.invalidateQueries({ queryKey: ["all-grievances"] });
        setUpdates((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return { updates };
};

export const useRealtimeProposals = (userId?: string) => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToProposals(
      userId,
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["proposals"] });
        queryClient.invalidateQueries({ queryKey: ["all-proposals"] });
        setUpdates((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return { updates };
};

export const useRealtimeAgencyProposals = (userId?: string) => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToAgencyProposals(
      userId,
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["agency-proposals"] });
        setUpdates((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return { updates };
};

export const useRealtimeCourseRegistrations = (userId?: string) => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToCourseRegistrations(
      userId,
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["course-registrations-new"] });
        setUpdates((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return { updates };
};

export const useRealtimeFunds = () => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToFundsAllocation((payload) => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["agency-data"] });
      setUpdates((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return { updates };
};

export const useRealtimeBeneficiaries = () => {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToBeneficiaries((payload) => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      queryClient.invalidateQueries({ queryKey: ["agency-data"] });
      setUpdates((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return { updates };
};
