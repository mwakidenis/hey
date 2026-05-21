import { useVisibilityChange } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo } from "react";
import { getNotificationTimestamp } from "@/helpers/getNotificationTimestamp";
import {
  clearNotificationAppBadge,
  setNotificationAppBadge
} from "@/helpers/notificationBadging";
import { useIntervalWhen } from "@/hooks/useIntervalWhen";
import {
  NotificationOrderBy,
  useNotificationIndicatorQuery
} from "@/indexer/generated";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import type { AnyNotificationFragment } from "@/types/notifications";

const useHasNewNotifications = () => {
  const { currentAccount } = useAccountStore();
  const { getLastSeenNotificationTimestamp } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();
  const documentVisible = useVisibilityChange();

  const lastSeenNotificationTimestamp = currentAccount
    ? getLastSeenNotificationTimestamp(currentAccount.address)
    : null;

  const { data, refetch } = useNotificationIndicatorQuery({
    fetchPolicy: "no-cache",
    skip: !currentAccount,
    variables: {
      request: {
        filter: { includeLowScore },
        orderBy: NotificationOrderBy.Default
      }
    }
  });

  const refetchNotifications = useCallback(() => refetch(), [refetch]);

  useIntervalWhen(refetchNotifications, {
    ms: 60 * 1000,
    startImmediately: true,
    when: Boolean(currentAccount && documentVisible)
  });

  const newNotificationCount = useMemo(() => {
    if (!currentAccount || !lastSeenNotificationTimestamp) {
      return 0;
    }

    return (
      data?.notifications?.items?.filter((notification) => {
        const timestamp = getNotificationTimestamp(
          notification as AnyNotificationFragment
        );

        return timestamp
          ? new Date(timestamp) > new Date(lastSeenNotificationTimestamp)
          : false;
      }).length ?? 0
    );
  }, [currentAccount, data, lastSeenNotificationTimestamp]);

  useEffect(() => {
    if (!currentAccount || !newNotificationCount) {
      clearNotificationAppBadge();
      return;
    }

    setNotificationAppBadge(newNotificationCount);
  }, [currentAccount, newNotificationCount]);

  return newNotificationCount > 0;
};

export default useHasNewNotifications;
