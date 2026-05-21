import type { Dispatch, SetStateAction } from "react";
import { Tabs } from "@/components/Shared/UI";
import { NotificationFeedType } from "@/data/enums";
import cn from "@/helpers/cn";

interface FeedTypeProps {
  className?: string;
  feedType: NotificationFeedType;
  setFeedType: Dispatch<SetStateAction<NotificationFeedType>>;
}

const FeedType = ({ className, feedType, setFeedType }: FeedTypeProps) => {
  const tabs = [
    { name: "All", type: NotificationFeedType.All },
    { name: "Mentions", type: NotificationFeedType.Mentions },
    { name: "Comments", type: NotificationFeedType.Comments },
    { name: "Likes", type: NotificationFeedType.Likes },
    { name: "Actions", type: NotificationFeedType.PostActions },
    { name: "Rewards", type: NotificationFeedType.Rewards }
  ];

  return (
    <Tabs
      active={feedType}
      className={cn("mx-5 mb-5 md:mx-0", className)}
      layoutId="notification_tab"
      setActive={(type) => {
        const nextType = type as NotificationFeedType;
        setFeedType(nextType);
      }}
      tabs={tabs}
    />
  );
};

export default FeedType;
