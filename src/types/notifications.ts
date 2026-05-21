import type {
  AccountActionExecutedNotificationFragment,
  CommentNotificationFragment,
  FollowNotificationFragment,
  GroupMembershipRequestApprovedNotificationFragment,
  GroupMembershipRequestRejectedNotificationFragment,
  MentionNotificationFragment,
  PostActionExecutedNotificationFragment,
  QuoteNotificationFragment,
  ReactionNotificationFragment,
  RepostNotificationFragment,
  TokenDistributedNotificationFragment
} from "@/indexer/generated";

export type AnyNotificationFragment =
  | AccountActionExecutedNotificationFragment
  | CommentNotificationFragment
  | FollowNotificationFragment
  | GroupMembershipRequestApprovedNotificationFragment
  | GroupMembershipRequestRejectedNotificationFragment
  | MentionNotificationFragment
  | PostActionExecutedNotificationFragment
  | QuoteNotificationFragment
  | ReactionNotificationFragment
  | RepostNotificationFragment
  | TokenDistributedNotificationFragment;
