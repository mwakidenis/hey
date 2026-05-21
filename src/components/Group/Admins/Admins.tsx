import { UserGroupIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { Virtualizer } from "virtua";
import AdminActions from "@/components/Group/Members/Actions";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import { EmptyState, ErrorMessage } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import type { AccountFragment, GroupFragment } from "@/indexer/generated";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { accountsList } from "@/variants";

interface AdminsProps {
  accounts: AccountFragment[] | undefined;
  error?: Error;
  group: GroupFragment;
  loading: boolean;
}

const Admins = ({ accounts, error, group, loading }: AdminsProps) => {
  const { currentAccount } = useAccountStore();
  const adminAddresses = accounts?.map((account) => account.address);

  if (loading) {
    return <AccountListShimmer />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load admins"
      />
    );
  }

  if (!accounts?.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<UserGroupIcon className="size-8" />}
          message="No admins"
        />
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtualizer>
        {accounts.map((account, index) => (
          <motion.div
            animate="visible"
            className={cn(
              "divider p-5",
              index === accounts.length - 1 && "border-b-0"
            )}
            initial="hidden"
            key={account.address}
            variants={accountsList}
          >
            <SingleAccount
              account={account}
              action={
                <AdminActions
                  account={account}
                  admins={adminAddresses}
                  group={group}
                />
              }
              hideFollowButton={currentAccount?.address === account.address}
              hideUnfollowButton={currentAccount?.address === account.address}
              showBio
              showUserPreview={false}
            />
          </motion.div>
        ))}
      </Virtualizer>
    </div>
  );
};

export default Admins;
