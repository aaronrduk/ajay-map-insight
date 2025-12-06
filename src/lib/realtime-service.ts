import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type SubscriptionCallback<T = any> = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
}) => void;

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribeToTable<T = any>(
    tableName: string,
    callback: SubscriptionCallback<T>,
    filter?: string
  ): () => void {
    const channelName = `${tableName}_${filter || "all"}_${Date.now()}`;

    let channelBuilder = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: filter,
        },
        (payload: any) => {
          callback(payload);
        }
      );

    const channel = channelBuilder.subscribe();
    this.channels.set(channelName, channel);

    return () => {
      this.unsubscribe(channelName);
    };
  }

  subscribeToNotifications(userId: string, callback: SubscriptionCallback) {
    return this.subscribeToTable(
      "notifications",
      callback,
      `user_id=eq.${userId}`
    );
  }

  subscribeToGrievances(userId?: string, callback?: SubscriptionCallback) {
    if (userId && callback) {
      return this.subscribeToTable(
        "grievances",
        callback,
        `user_id=eq.${userId}`
      );
    }
    if (callback) {
      return this.subscribeToTable("grievances", callback);
    }
    return () => {};
  }

  subscribeToProposals(userId?: string, callback?: SubscriptionCallback) {
    if (userId && callback) {
      return this.subscribeToTable(
        "proposals",
        callback,
        `user_id=eq.${userId}`
      );
    }
    if (callback) {
      return this.subscribeToTable("proposals", callback);
    }
    return () => {};
  }

  subscribeToAgencyProposals(userId?: string, callback?: SubscriptionCallback) {
    if (userId && callback) {
      return this.subscribeToTable(
        "agency_proposals",
        callback,
        `user_id=eq.${userId}`
      );
    }
    if (callback) {
      return this.subscribeToTable("agency_proposals", callback);
    }
    return () => {};
  }

  subscribeToCourseRegistrations(userId?: string, callback?: SubscriptionCallback) {
    if (userId && callback) {
      return this.subscribeToTable(
        "course_registrations_new",
        callback,
        `user_id=eq.${userId}`
      );
    }
    if (callback) {
      return this.subscribeToTable("course_registrations_new", callback);
    }
    return () => {};
  }

  subscribeToFundsAllocation(callback: SubscriptionCallback) {
    return this.subscribeToTable("funds_allocation", callback);
  }

  subscribeToBeneficiaries(callback: SubscriptionCallback) {
    return this.subscribeToTable("scheme_beneficiaries", callback);
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
