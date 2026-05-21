import type { AnyNotificationFragment } from "@/types/notifications";

export const getNotificationTimestamp = (
  notification: AnyNotificationFragment
): null | string => {
  switch (notification.__typename) {
    case "AccountActionExecutedNotification":
    case "PostActionExecutedNotification":
      return notification.actions[0]?.executedAt ?? null;
    case "CommentNotification":
      return notification.comment.timestamp;
    case "FollowNotification":
      return notification.followers[0]?.followedAt ?? null;
    case "GroupMembershipRequestApprovedNotification":
      return notification.approvedAt;
    case "GroupMembershipRequestRejectedNotification":
      return notification.rejectedAt;
    case "MentionNotification":
      return notification.post.timestamp;
    case "QuoteNotification":
      return notification.quote.timestamp;
    case "ReactionNotification":
      return notification.reactions[0]?.reactions[0]?.reactedAt ?? null;
    case "RepostNotification":
      return notification.reposts[0]?.repostedAt ?? null;
    case "TokenDistributedNotification":
      return notification.actionDate;
    default:
      return null;
  }
};
