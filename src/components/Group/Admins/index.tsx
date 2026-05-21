import plur from "plur";
import { useState } from "react";
import GraphStatsShimmer from "@/components/Shared/Shimmer/GraphStatsShimmer";
import { Modal } from "@/components/Shared/UI";
import humanize from "@/helpers/humanize";
import {
  type GroupFragment,
  PageSize,
  useAdminsForQuery
} from "@/indexer/generated";
import Admins from "./Admins";

interface AdminCountProps {
  group: GroupFragment;
}

const AdminCount = ({ group }: AdminCountProps) => {
  const [showModal, setShowModal] = useState(false);

  const { data, error, loading } = useAdminsForQuery({
    variables: {
      request: {
        address: group.address,
        pageSize: PageSize.Fifty
      }
    }
  });

  if (loading) {
    return <GraphStatsShimmer count={1} />;
  }

  const accounts = data?.adminsFor.items.map((item) => item.account);
  const count = accounts?.length ?? 0;

  if (count === 0) {
    return null;
  }

  return (
    <div className="flex gap-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowModal(true)}
        type="button"
      >
        <b>{humanize(count)}</b>
        <span className="text-gray-500 dark:text-gray-200">
          {plur("Admin", count)}
        </span>
      </button>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Group Admins"
      >
        <Admins
          accounts={accounts}
          error={error}
          group={group}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default AdminCount;
