import { supabase } from "@/integrations/supabase/client";

export interface Registration {
  id: string;
  user_id: string;
  agency_id?: string;
  full_name: string;
  course_id: string;
  college_id: string;
  preferred_batch?: string;
  reason: string;
  additional_info?: string;
  documents: Array<{ name: string; url: string; type: string }>;
  status: string;
  admin_comment?: string;
  admin_user_id?: string;
  reviewed_at?: string;
  source: string;
  audit_log: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationInput {
  course_id: string;
  college_id: string;
  full_name: string;
  reason: string;
  preferred_batch?: string;
  additional_info?: string;
  documents?: Array<{ name: string; url: string; type: string }>;
  agency_id?: string;
  source?: string;
}

export interface ReviewRegistrationInput {
  status: "accepted" | "rejected" | "pending";
  admin_comment: string;
  send_notification?: boolean;
}

export const registrationService = {
  async createRegistration(input: CreateRegistrationInput): Promise<Registration> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("course_registrations_new")
      .insert({
        user_id: userData.user.id,
        full_name: input.full_name,
        course_id: input.course_id,
        college_id: input.college_id,
        reason: input.reason,
        preferred_batch: input.preferred_batch,
        additional_info: input.additional_info,
        documents: input.documents || [],
        agency_id: input.agency_id,
        source: input.source || "citizen",
        status: "pending",
        audit_log: [
          {
            action: "created",
            timestamp: new Date().toISOString(),
            actor_id: userData.user.id,
          },
        ],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("course_registrations_new")
      .select(
        `
        *,
        courses!course_registrations_new_course_id_fkey (
          course_name,
          component
        ),
        colleges!course_registrations_new_college_id_fkey (
          name,
          district,
          state
        )
      `
      )
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRegistrationById(id: string): Promise<Registration | null> {
    const { data, error } = await supabase
      .from("course_registrations_new")
      .select(
        `
        *,
        courses!course_registrations_new_course_id_fkey (
          course_name,
          component,
          description
        ),
        colleges!course_registrations_new_college_id_fkey (
          name,
          district,
          state,
          address
        ),
        portal_users!course_registrations_new_user_id_fkey (
          name,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllRegistrations(
    status?: string,
    limit = 50,
    offset = 0
  ): Promise<Registration[]> {
    let query = supabase
      .from("course_registrations_new")
      .select(
        `
        *,
        courses!course_registrations_new_course_id_fkey (
          course_name,
          component
        ),
        colleges!course_registrations_new_college_id_fkey (
          name,
          district,
          state
        ),
        portal_users!course_registrations_new_user_id_fkey (
          name,
          email
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async reviewRegistration(
    id: string,
    input: ReviewRegistrationInput
  ): Promise<Registration> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("course_registrations_new")
      .update({
        status: input.status,
        admin_comment: input.admin_comment,
        admin_user_id: userData.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (input.send_notification && data) {
      await this.sendNotification(data.user_id, {
        title: "Registration Status Updated",
        body: `Your course registration has been ${input.status}. ${input.admin_comment}`,
        link: "/citizen/registrations",
        type: "info",
      });
    }

    return data;
  },

  async sendNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      link?: string;
      type?: string;
    }
  ): Promise<void> {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      type: notification.type || "info",
    });

    if (error) throw error;
  },

  async getAuditLog(registrationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("registration_audit")
      .select("*")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  }> {
    const { data, error } = await supabase
      .from("course_registrations_new")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter((r) => r.status === "pending").length || 0,
      accepted: data?.filter((r) => r.status === "accepted").length || 0,
      rejected: data?.filter((r) => r.status === "rejected").length || 0,
    };

    return stats;
  },
};

export const coursesService = {
  async getAllCourses(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("course_name")
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async searchCourses(searchTerm: string) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .ilike("course_name", `%${searchTerm}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async getCollegesByCourse(courseId: string) {
    const { data, error } = await supabase
      .from("college_courses")
      .select(
        `
        college_id,
        colleges!college_courses_college_id_fkey (
          id,
          college_id,
          name,
          district,
          state,
          type,
          address
        )
      `
      )
      .eq("course_id", courseId)
      .eq("available", true);

    if (error) throw error;
    return data?.map((cc) => cc.colleges).filter(Boolean) || [];
  },
};

export const syncService = {
  async triggerCoursesSync(): Promise<any> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-courses-colleges`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  },

  async getSyncMetadata() {
    const { data, error } = await supabase
      .from("sync_metadata")
      .select("*")
      .in("resource_id", ["courses", "colleges"]);

    if (error) throw error;
    return data || [];
  },
};
