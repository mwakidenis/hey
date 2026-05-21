import plur from "plur";
import { useState } from "react";
import GraphStatsShimmer from "@/components/Shared/Shimmer/GraphStatsShimmer";
import { Modal } from "@/components/Shared/UI";
import humanize from "@/helpers/humanize";
import { PageSize, useGroupMembershipRequestsQuery } from "@/indexer/generated";
import Requests from "./Requests";

interface RequestsCountProps {
  groupAddress: string;
}

const RequestsCount = ({ groupAddress }: RequestsCountProps) => {
  const [showMemberRequestsModal, setShowMemberRequestsModal] = useState(false);

  const { data, loading } = useGroupMembershipRequestsQuery({
    variables: {
      request: {
        group: groupAddress,
        pageSize: PageSize.Fifty
      }
    }
  });

  if (loading) {
    return <GraphStatsShimmer count={1} />;
  }

  const count = data?.groupMembershipRequests.items.length ?? 0;
  const hasMore = data?.groupMembershipRequests.pageInfo.next;

  if (count === 0) {
    return null;
  }

  return (
    <div className="flex gap-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowMemberRequestsModal(true)}
        type="button"
      >
        <b>
          {humanize(count)}
          {hasMore && "+"}
        </b>
        <span className="text-gray-500 dark:text-gray-200">
          {plur("Request", count)}
        </span>
      </button>
      <Modal
        onClose={() => setShowMemberRequestsModal(false)}
        show={showMemberRequestsModal}
        size="xs"
        title="Membership Requests"
      >
        <Requests groupAddress={groupAddress} />
      </Modal>
    </div>
  );
};

export default RequestsCount;
