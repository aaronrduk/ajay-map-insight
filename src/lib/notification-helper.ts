import { createNotification } from "./api-service";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationCategory =
  | "general"
  | "proposal"
  | "grievance"
  | "registration"
  | "course"
  | "grant"
  | "system";

interface CreateNotificationParams {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  link?: string;
  metadata?: any;
}

export const sendNotification = async ({
  userId,
  title,
  body,
  type = "info",
  priority = "normal",
  category = "general",
  link,
  metadata,
}: CreateNotificationParams) => {
  try {
    await createNotification({
      user_id: userId,
      title,
      body,
      type,
      priority,
      category,
      link,
      read: false,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};

export const notifyProposalStatusChange = async (
  userId: string,
  proposalTitle: string,
  newStatus: string,
  link?: string
) => {
  const statusMessages: Record<string, { title: string; body: string; type: NotificationType; priority: NotificationPriority }> = {
    approved: {
      title: "Proposal Approved",
      body: `Your proposal "${proposalTitle}" has been approved!`,
      type: "success",
      priority: "high",
    },
    rejected: {
      title: "Proposal Rejected",
      body: `Your proposal "${proposalTitle}" has been rejected. Please check the review notes.`,
      type: "warning",
      priority: "high",
    },
    under_review: {
      title: "Proposal Under Review",
      body: `Your proposal "${proposalTitle}" is now under review.`,
      type: "info",
      priority: "normal",
    },
    pending: {
      title: "Proposal Received",
      body: `Your proposal "${proposalTitle}" has been received and is pending review.`,
      type: "info",
      priority: "normal",
    },
  };

  const message = statusMessages[newStatus] || {
    title: "Proposal Status Updated",
    body: `Your proposal "${proposalTitle}" status has been updated to ${newStatus}.`,
    type: "info" as NotificationType,
    priority: "normal" as NotificationPriority,
  };

  await sendNotification({
    userId,
    title: message.title,
    body: message.body,
    type: message.type,
    priority: message.priority,
    category: "proposal",
    link,
  });
};

export const notifyGrievanceStatusChange = async (
  userId: string,
  grievanceRef: string,
  newStatus: string,
  link?: string
) => {
  const statusMessages: Record<string, { title: string; body: string; type: NotificationType; priority: NotificationPriority }> = {
    resolved: {
      title: "Grievance Resolved",
      body: `Your grievance ${grievanceRef} has been resolved.`,
      type: "success",
      priority: "high",
    },
    in_progress: {
      title: "Grievance In Progress",
      body: `Your grievance ${grievanceRef} is being processed.`,
      type: "info",
      priority: "normal",
    },
    pending: {
      title: "Grievance Received",
      body: `Your grievance ${grievanceRef} has been received.`,
      type: "info",
      priority: "normal",
    },
  };

  const message = statusMessages[newStatus] || {
    title: "Grievance Status Updated",
    body: `Your grievance ${grievanceRef} status has been updated to ${newStatus}.`,
    type: "info" as NotificationType,
    priority: "normal" as NotificationPriority,
  };

  await sendNotification({
    userId,
    title: message.title,
    body: message.body,
    type: message.type,
    priority: message.priority,
    category: "grievance",
    link,
  });
};

export const notifyCourseRegistrationStatusChange = async (
  userId: string,
  courseName: string,
  newStatus: string,
  link?: string
) => {
  const statusMessages: Record<string, { title: string; body: string; type: NotificationType; priority: NotificationPriority }> = {
    approved: {
      title: "Course Registration Approved",
      body: `Your registration for "${courseName}" has been approved!`,
      type: "success",
      priority: "high",
    },
    rejected: {
      title: "Course Registration Rejected",
      body: `Your registration for "${courseName}" has been rejected. Please check the comments.`,
      type: "warning",
      priority: "high",
    },
    pending: {
      title: "Course Registration Received",
      body: `Your registration for "${courseName}" has been received and is pending review.`,
      type: "info",
      priority: "normal",
    },
  };

  const message = statusMessages[newStatus] || {
    title: "Registration Status Updated",
    body: `Your registration for "${courseName}" status has been updated to ${newStatus}.`,
    type: "info" as NotificationType,
    priority: "normal" as NotificationPriority,
  };

  await sendNotification({
    userId,
    title: message.title,
    body: message.body,
    type: message.type,
    priority: message.priority,
    category: "registration",
    link,
  });
};

export const notifyNewProposal = async (
  adminUserIds: string[],
  proposalTitle: string,
  submitterName: string,
  link?: string
) => {
  const promises = adminUserIds.map((userId) =>
    sendNotification({
      userId,
      title: "New Proposal Submitted",
      body: `${submitterName} has submitted a new proposal: "${proposalTitle}"`,
      type: "info",
      priority: "normal",
      category: "proposal",
      link,
    })
  );

  await Promise.all(promises);
};

export const notifyNewGrievance = async (
  adminUserIds: string[],
  grievanceRef: string,
  submitterName: string,
  link?: string
) => {
  const promises = adminUserIds.map((userId) =>
    sendNotification({
      userId,
      title: "New Grievance Submitted",
      body: `${submitterName} has submitted a new grievance: ${grievanceRef}`,
      type: "info",
      priority: "high",
      category: "grievance",
      link,
    })
  );

  await Promise.all(promises);
};

export const notifySystemMaintenance = async (
  userIds: string[],
  maintenanceDate: string,
  duration: string
) => {
  const promises = userIds.map((userId) =>
    sendNotification({
      userId,
      title: "Scheduled System Maintenance",
      body: `The system will be under maintenance on ${maintenanceDate} for approximately ${duration}. Please plan accordingly.`,
      type: "warning",
      priority: "high",
      category: "system",
    })
  );

  await Promise.all(promises);
};
