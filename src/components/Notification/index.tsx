import { useState } from "react";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import { NotificationFeedType } from "@/data/enums";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import FeedType from "./FeedType";
import List from "./List";
import Settings from "./Settings";

const Notification = () => {
  const { currentAccount } = useAccountStore();
  const [feedType, setFeedType] = useState<NotificationFeedType>(
    NotificationFeedType.All
  );

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Notifications">
      <div className="mx-5 mb-5 flex items-start justify-between gap-3 md:mx-0">
        <FeedType
          className="mx-0 mb-0"
          feedType={feedType}
          setFeedType={setFeedType}
        />
        <Settings />
      </div>
      <List feedType={feedType} />
    </PageLayout>
  );
};

export default Notification;
