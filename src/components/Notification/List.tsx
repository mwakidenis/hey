import { BellIcon } from "@heroicons/react/24/outline";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { WindowVirtualizer } from "virtua";
import AccountActionExecutedNotification from "@/components/Notification/Type/AccountActionExecutedNotification";
import CommentNotification from "@/components/Notification/Type/CommentNotification";
import FollowNotification from "@/components/Notification/Type/FollowNotification";
import GroupMembershipRequestApprovedNotification from "@/components/Notification/Type/GroupMembershipRequestApprovedNotification";
import GroupMembershipRequestRejectedNotification from "@/components/Notification/Type/GroupMembershipRequestRejectedNotification";
import MentionNotification from "@/components/Notification/Type/MentionNotification";
import PostActionExecutedNotification from "@/components/Notification/Type/PostActionExecutedNotification";
import QuoteNotification from "@/components/Notification/Type/QuoteNotification";
import ReactionNotification from "@/components/Notification/Type/ReactionNotification";
import RepostNotification from "@/components/Notification/Type/RepostNotification";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import { NotificationFeedType } from "@/data/enums";
import cn from "@/helpers/cn";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import { clearNotificationAppBadge } from "@/helpers/notificationBadging";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import {
  type NotificationRequest,
  NotificationType,
  useNotificationsQuery
} from "@/indexer/generated";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import type { AnyNotificationFragment } from "@/types/notifications";
import NotificationShimmer from "./Shimmer";
import TokenDistributedNotification from "./Type/TokenDistributedNotification";

const notificationComponentMap = {
  AccountActionExecutedNotification,
  CommentNotification,
  FollowNotification,
  GroupMembershipRequestApprovedNotification,
  GroupMembershipRequestRejectedNotification,
  MentionNotification,
  PostActionExecutedNotification,
  QuoteNotification,
  ReactionNotification,
  RepostNotification,
  TokenDistributedNotification
};

interface ListProps {
  feedType: NotificationFeedType;
}

const List = ({ feedType }: ListProps) => {
  const {
    getLastSeenNotificationTimestamp,
    notificationRefreshSignal,
    setLastSeenNotificationTimestamp
  } = useNotificationStore();
  const { currentAccount } = useAccountStore();
  const { includeLowScore } = usePreferencesStore();

  const currentSeenTimestamp = useCallback(
    () =>
      currentAccount
        ? getLastSeenNotificationTimestamp(currentAccount.address)
        : new Date().toISOString(),
    [currentAccount, getLastSeenNotificationTimestamp]
  );

  const seenAtMountRef = useRef(currentSeenTimestamp());

  useEffect(() => {
    seenAtMountRef.current = currentSeenTimestamp();
    clearNotificationAppBadge();
  }, [currentSeenTimestamp, notificationRefreshSignal]);

  const getNotificationType = useCallback(() => {
    switch (feedType) {
      case NotificationFeedType.All:
        return;
      case NotificationFeedType.Mentions:
        return [NotificationType.Mentioned];
      case NotificationFeedType.Comments:
        return [NotificationType.Commented];
      case NotificationFeedType.Likes:
        return [NotificationType.Reacted];
      case NotificationFeedType.PostActions:
        return [
          NotificationType.ExecutedPostAction,
          NotificationType.ExecutedAccountAction
        ];
      case NotificationFeedType.Rewards:
        return [NotificationType.TokenDistributed];
      default:
        return;
    }
  }, [feedType]);

  const request: NotificationRequest = useMemo(
    () => ({
      filter: {
        includeLowScore,
        notificationTypes: getNotificationType()
      }
    }),
    [getNotificationType, includeLowScore]
  );

  const { data, error, fetchMore, loading } = useNotificationsQuery({
    variables: { request }
  });

  const notifications = data?.notifications?.items;
  const pageInfo = data?.notifications?.pageInfo;
  const hasMore = !!pageInfo?.next;

  useEffect(() => {
    const firstNotification = notifications?.[0];
    if (
      !firstNotification ||
      typeof firstNotification !== "object" ||
      !("id" in firstNotification)
    ) {
      return;
    }
    const timestamp = getNotificationTimestamp(
      firstNotification as AnyNotificationFragment
    );
    if (currentAccount && timestamp) {
      setLastSeenNotificationTimestamp(currentAccount.address, timestamp);
    }
    clearNotificationAppBadge();
  }, [currentAccount, notifications, setLastSeenNotificationTimestamp]);

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading) {
    return (
      <Card className="divide-y divide-gray-200 dark:divide-gray-700">
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
      </Card>
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load notifications" />;
  }

  if (!notifications?.length) {
    return (
      <EmptyState
        icon={<BellIcon className="size-8" />}
        message="Inbox zero!"
      />
    );
  }

  return (
    <Card className="virtual-divider-list-window">
      <WindowVirtualizer>
        {notifications.map((notification) => {
          if (!("id" in notification)) {
            return null;
          }

          const Component =
            notificationComponentMap[
              notification.__typename as keyof typeof notificationComponentMap
            ];

          if (!Component) {
            return null;
          }

          const timestamp = getNotificationTimestamp(
            notification as AnyNotificationFragment
          );
          const isNew = timestamp
            ? new Date(timestamp) > new Date(seenAtMountRef.current)
            : false;

          return (
            <div
              className={cn("relative", {
                "p-5": notification.__typename !== "FollowNotification"
              })}
              key={notification.id}
            >
              {isNew && (
                <span className="absolute top-6 left-2 size-2 rounded-full bg-red-500" />
              )}
              <Component notification={notification as never} />
            </div>
          );
        })}
        {hasMore && <span ref={loadMoreRef} />}
      </WindowVirtualizer>
    </Card>
  );
};

export default memo(List);
