import { UserGroupIcon } from "@heroicons/react/24/outline";
import { memo } from "react";
import { Link } from "react-router";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { Image } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import formatAddress from "@/helpers/formatAddress";
import getAvatar from "@/helpers/getAvatar";
import type { GroupMembershipRequestRejectedNotificationFragment } from "@/indexer/generated";

interface GroupMembershipRequestRejectedNotificationProps {
  notification: GroupMembershipRequestRejectedNotificationFragment;
}

const GroupMembershipRequestRejectedNotification = ({
  notification
}: GroupMembershipRequestRejectedNotificationProps) => {
  const { group, rejectedBy } = notification;
  const groupName = group.metadata?.name
    ? `#${group.metadata.name}`
    : formatAddress(group.address);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <UserGroupIcon className="size-6" />
        <Link to={`/g/${group.address}`}>
          <Image
            alt={group.address}
            className="size-8 rounded-lg border border-gray-200 bg-gray-200 object-cover dark:border-gray-700"
            height={32}
            loading="lazy"
            src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
            width={32}
          />
        </Link>
      </div>
      <div className="ml-9 flex flex-wrap items-center gap-x-1">
        <AggregatedNotificationTitle
          firstAccount={rejectedBy}
          linkToType={`/g/${group.address}`}
          text="rejected your request to join"
        />
        <Link className="font-bold hover:underline" to={`/g/${group.address}`}>
          {groupName}
        </Link>
      </div>
    </div>
  );
};

export default memo(GroupMembershipRequestRejectedNotification);
