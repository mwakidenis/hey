import {
  type Reference,
  type StoreObject,
  useApolloClient
} from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { UserMinusIcon } from "@heroicons/react/24/outline";
import { type MouseEvent, useCallback } from "react";
import { toast } from "sonner";
import Loader from "@/components/Shared/Loader";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import {
  type AccountFragment,
  useUnbanGroupAccountsMutation
} from "@/indexer/generated";
import type { ApolloClientError } from "@/types/errors";

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
  );

interface UnbanAccountProps {
  account: AccountFragment;
  groupAddress: string;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const UnbanAccount = ({
  account,
  groupAddress,
  isSubmitting,
  setIsSubmitting
}: UnbanAccountProps) => {
  const client = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();

  const updateCache = useCallback(() => {
    client.cache.modify({
      fields: {
        groupBannedAccounts(existing, { readField }) {
          if (!existing?.items) {
            return existing;
          }

          return {
            ...existing,
            items: existing.items.filter(
              (itemRef: any) =>
                readField(
                  "address",
                  readField("account", itemRef) as
                    | Reference
                    | StoreObject
                    | undefined
                ) !== account.address
            )
          };
        }
      }
    });
  }, [account.address, client]);

  const onError = useCallback(
    (error: ApolloClientError) => {
      setIsSubmitting(false);
      errorToast(error);
    },
    [setIsSubmitting]
  );

  const onCompleted = () => {
    updateCache();
    setIsSubmitting(false);
    toast.success("Account unbanned");
  };

  const [unbanAccounts] = useUnbanGroupAccountsMutation({
    onCompleted: async ({ unbanGroupAccounts }) => {
      if (unbanGroupAccounts.__typename === "UnbanGroupAccountsResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: unbanGroupAccounts
      });
    },
    onError
  });

  const handleClick = useCallback(
    async (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);

      await unbanAccounts({
        variables: {
          request: {
            accounts: [account.address],
            group: groupAddress
          }
        }
      });
    },
    [account.address, groupAddress, setIsSubmitting, unbanAccounts]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? <Loader small /> : <UserMinusIcon className="size-4" />}
      <div>Unban account</div>
    </MenuItem>
  );
};

export default UnbanAccount;
