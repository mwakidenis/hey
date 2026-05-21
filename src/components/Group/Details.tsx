import { useCallback, useState } from "react";
import JoinLeaveButton from "@/components/Shared/Group/JoinLeaveButton";
import Markup from "@/components/Shared/Markup";
import { H3, Image, LightBox } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import getAvatar from "@/helpers//getAvatar";
import getMentions from "@/helpers/getMentions";
import type { GroupFragment } from "@/indexer/generated";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import AdminCount from "./Admins";
import MembersCount from "./MembersCount";
import GroupMenu from "./Menu";
import RequestsCount from "./Requests";

interface DetailsProps {
  group: GroupFragment;
}

const Details = ({ group }: DetailsProps) => {
  const { currentAccount } = useAccountStore();
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const isOwner = currentAccount?.address === group.owner;

  const handleShowLightBox = useCallback(() => {
    setShowLightBox(true);
  }, []);

  const handleCloseLightBox = useCallback(() => {
    setShowLightBox(false);
  }, []);

  return (
    <div className="mb-4 space-y-3 px-5 md:px-0">
      <div className="flex items-start justify-between">
        <div className="relative -mt-24 ml-5 size-32 sm:-mt-24 sm:size-36">
          <Image
            alt={group.address}
            className="size-32 cursor-pointer rounded-xl bg-gray-200 ring-3 ring-gray-50 sm:size-36 dark:bg-gray-700 dark:ring-black"
            height={128}
            onClick={handleShowLightBox}
            src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
            width={128}
          />
          <LightBox
            images={[getAvatar(group, TRANSFORMS.EXPANDED_AVATAR)]}
            onClose={handleCloseLightBox}
            show={showLightBox}
          />
        </div>
        {isOwner ? (
          <GroupMenu group={group} />
        ) : (
          <JoinLeaveButton group={group} />
        )}
      </div>
      <H3 className="truncate py-2">{group.metadata?.name}</H3>
      {group.metadata?.description ? (
        <div className="markup linkify mr-0 break-words sm:mr-10">
          <Markup mentions={getMentions(group.metadata?.description)}>
            {group.metadata?.description}
          </Markup>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <MembersCount group={group} />
        <AdminCount group={group} />
        {isOwner ? <RequestsCount groupAddress={group.address} /> : null}
      </div>
    </div>
  );
};

export default Details;
