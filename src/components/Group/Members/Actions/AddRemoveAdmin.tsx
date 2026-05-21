import { useApolloClient } from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { type MouseEvent, useCallback } from "react";
import { toast } from "sonner";
import Loader from "@/components/Shared/Loader";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import {
  type AccountFragment,
  AdminsForDocument,
  type AdminsForQuery,
  PageSize,
  useAddAdminsMutation,
  useRemoveAdminsMutation
} from "@/indexer/generated";
import type { ApolloClientError } from "@/types/errors";

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm"
  );

interface AddRemoveAdminProps {
  account: AccountFragment;
  admins: string[] | undefined;
  groupAddress: string;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const AddRemoveAdmin = ({
  account,
  admins,
  groupAddress,
  isSubmitting,
  setIsSubmitting
}: AddRemoveAdminProps) => {
  const client = useApolloClient();
  const handleTransactionLifecycle = useTransactionLifecycle();
  const isAdmin = admins?.some(
    (admin) => admin.toLowerCase() === account.address.toLowerCase()
  );

  const onError = useCallback(
    (error: ApolloClientError) => {
      setIsSubmitting(false);
      errorToast(error);
    },
    [setIsSubmitting]
  );

  const updateCache = useCallback(
    (isRemoval: boolean) => {
      const variables = {
        request: { address: groupAddress, pageSize: PageSize.Fifty }
      };

      const currentData = client.cache.readQuery<AdminsForQuery>({
        query: AdminsForDocument,
        variables
      });

      if (!currentData?.adminsFor) {
        return;
      }

      const newItems = isRemoval
        ? currentData.adminsFor.items.filter(
            (item) => item.account.address !== account.address
          )
        : currentData.adminsFor.items.some(
              (item) => item.account.address === account.address
            )
          ? currentData.adminsFor.items
          : [
              { __typename: "Admin" as const, account },
              ...currentData.adminsFor.items
            ];

      client.cache.writeQuery({
        data: {
          adminsFor: {
            ...currentData.adminsFor,
            items: newItems
          }
        },
        overwrite: true,
        query: AdminsForDocument,
        variables
      });
    },
    [account, client, groupAddress]
  );

  const onCompleted = (isRemoval: boolean) => {
    updateCache(isRemoval);
    setIsSubmitting(false);
    toast.success(
      isRemoval ? "Admin removed successfully" : "Admin added successfully"
    );
  };

  const [addAdmins] = useAddAdminsMutation({
    onCompleted: async ({ addAdmins }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(false),
        onError,
        transactionData: addAdmins
      });
    },
    onError
  });

  const [removeAdmins] = useRemoveAdminsMutation({
    onCompleted: async ({ removeAdmins }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(true),
        onError,
        transactionData: removeAdmins
      });
    },
    onError
  });

  const handleClick = useCallback(
    async (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);

      if (isAdmin) {
        await removeAdmins({
          variables: {
            request: {
              address: groupAddress,
              admins: [account.address]
            }
          }
        });
        return;
      }

      await addAdmins({
        variables: {
          request: {
            address: groupAddress,
            admins: [account.address]
          }
        }
      });
    },
    [
      account.address,
      addAdmins,
      groupAddress,
      isAdmin,
      removeAdmins,
      setIsSubmitting
    ]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? (
        <Loader small />
      ) : isAdmin ? (
        <UserMinusIcon className="size-4" />
      ) : (
        <UserPlusIcon className="size-4" />
      )}
      <div>{isAdmin ? "Remove" : "Make"} admin</div>
    </MenuItem>
  );
};

export default AddRemoveAdmin;
