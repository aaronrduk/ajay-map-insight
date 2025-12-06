import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { realtimeService } from "@/lib/realtime-service";

type UserRole = "administrator" | "agency" | "citizen";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  unreadNotifications: number;
  refreshNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = async (userId: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    setUnreadNotifications(count || 0);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("pmajay_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.id) {
        fetchUnreadNotifications(parsedUser.id);

        const unsubscribe = realtimeService.subscribeToNotifications(
          parsedUser.id,
          (payload) => {
            if (payload.eventType === "INSERT" && !payload.new.read) {
              setUnreadNotifications((prev) => prev + 1);
            } else if (payload.eventType === "UPDATE") {
              if (payload.old.read === false && payload.new.read === true) {
                setUnreadNotifications((prev) => Math.max(0, prev - 1));
              }
            }
          }
        );

        return () => {
          unsubscribe();
        };
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
    setUnreadNotifications(0);
    localStorage.removeItem("pmajay_user");
    realtimeService.unsubscribeAll();
  };

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("pmajay_user", JSON.stringify(newUser));
      fetchUnreadNotifications(newUser.id);

      realtimeService.subscribeToNotifications(
        newUser.id,
        (payload) => {
          if (payload.eventType === "INSERT" && !payload.new.read) {
            setUnreadNotifications((prev) => prev + 1);
          } else if (payload.eventType === "UPDATE") {
            if (payload.old.read === false && payload.new.read === true) {
              setUnreadNotifications((prev) => Math.max(0, prev - 1));
            }
          }
        }
      );
    } else {
      localStorage.removeItem("pmajay_user");
      setUnreadNotifications(0);
      realtimeService.unsubscribeAll();
    }
  };

  const refreshNotifications = () => {
    if (user?.id) {
      fetchUnreadNotifications(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        logout,
        isAuthenticated: !!user,
        unreadNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
