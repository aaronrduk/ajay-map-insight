import { supabase } from "@/integrations/supabase/client";

export interface Certificate {
  id: string;
  registration_id: string;
  citizen_id: string;
  certificate_number: string;
  certificate_url: string | null;
  qr_code_data: string | null;
  course_name: string;
  college_name: string;
  issued_at: string;
  issued_by: string | null;
  verification_code: string;
  revoked: boolean;
  revoked_reason: string | null;
  created_at: string;
}

export interface EmailBroadcast {
  id: string;
  admin_id: string;
  title: string;
  body: string;
  recipients: any[];
  recipient_filter: string | null;
  attachment_url: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: string;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  created_at: string;
}

export const certificateService = {
  async getMyCertificates(): Promise<Certificate[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("citizen_id", userData.user.id)
      .order("issued_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async verifyCertificate(verificationCode: string): Promise<any> {
    const { data, error } = await supabase
      .from("certificate_verification")
      .select("*")
      .eq("verification_code", verificationCode)
      .single();

    if (error) throw error;
    return data;
  },

  async generateCertificatePDF(certificateId: string): Promise<any> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificate_id: certificateId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate certificate");
    }

    return await response.json();
  },

  async downloadCertificate(certificateId: string): Promise<void> {
    const result = await this.generateCertificatePDF(certificateId);

    const blob = new Blob([result.html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${result.certificate.certificate_number}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async getAllCertificates(limit = 50, offset = 0): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async revokeCertificate(
    certificateId: string,
    reason: string
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("certificates")
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_by: userData.user.id,
        revoked_reason: reason,
      })
      .eq("id", certificateId);

    if (error) throw error;
  },
};

export const broadcastService = {
  async createBroadcast(broadcast: {
    title: string;
    body: string;
    recipient_filter: string;
    attachment_url?: string;
    scheduled_at?: string;
  }): Promise<EmailBroadcast> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("email_broadcasts")
      .insert({
        admin_id: userData.user.id,
        title: broadcast.title,
        body: broadcast.body,
        recipient_filter: broadcast.recipient_filter,
        attachment_url: broadcast.attachment_url,
        scheduled_at: broadcast.scheduled_at,
        status: broadcast.scheduled_at ? "scheduled" : "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendBroadcast(broadcastId: string): Promise<any> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-mass-email`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ broadcast_id: broadcastId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send broadcast");
    }

    return await response.json();
  },

  async getAllBroadcasts(limit = 50, offset = 0): Promise<EmailBroadcast[]> {
    const { data, error } = await supabase
      .from("email_broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getBroadcastById(id: string): Promise<EmailBroadcast | null> {
    const { data, error } = await supabase
      .from("email_broadcasts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getEmailLogs(broadcastId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("email_broadcast_id", broadcastId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBroadcastStats(broadcastId: string): Promise<any> {
    const { data, error } = await supabase
      .from("email_broadcasts")
      .select("total_recipients, total_sent, total_failed, status")
      .eq("id", broadcastId)
      .single();

    if (error) throw error;
    return data;
  },
};

export const notificationService = {
  async getMyNotifications(limit = 20): Promise<any[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userData.user.id)
      .eq("read", false);

    if (error) throw error;
  },

  async getUnreadCount(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("read", false);

    if (error) throw error;
    return count || 0;
  },
};
