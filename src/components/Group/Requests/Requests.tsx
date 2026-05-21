import {
  type Reference,
  type StoreObject,
  useApolloClient
} from "@apollo/client";
import { UsersIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Virtualizer } from "virtua";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import Loader from "@/components/Shared/Loader";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import { Button, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import { ERRORS } from "@/data/errors";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import {
  type AccountFragment,
  type GroupMembershipRequestsRequest,
  PageSize,
  useApproveGroupMembershipRequestsMutation,
  useGroupMembershipRequestsQuery,
  useRejectGroupMembershipRequestsMutation
} from "@/indexer/generated";
import type { ApolloClientError } from "@/types/errors";
import { accountsList } from "@/variants";

interface RequestsProps {
  groupAddress: string;
}

const Requests = ({ groupAddress }: RequestsProps) => {
  const client = useApolloClient();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const handleTransactionLifecycle = useTransactionLifecycle();

  const request: GroupMembershipRequestsRequest = {
    group: groupAddress,
    pageSize: PageSize.Fifty
  };

  const { data, error, fetchMore, loading } = useGroupMembershipRequestsQuery({
    variables: { request }
  });

  const requests = data?.groupMembershipRequests.items;
  const pageInfo = data?.groupMembershipRequests.pageInfo;
  const hasMore = pageInfo?.next;

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const updateCache = useCallback(
    (account: AccountFragment, isApproval: boolean) => {
      client.cache.modify({
        fields: {
          groupMembershipRequests(existing, { readField }) {
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

      if (!isApproval) {
        return;
      }

      client.cache.modify({
        fields: {
          groupMembers(existing, { readField, toReference }) {
            if (!existing?.items) {
              return existing;
            }

            const alreadyExists = existing.items.some(
              (itemRef: any) =>
                readField(
                  "address",
                  readField("account", itemRef) as
                    | Reference
                    | StoreObject
                    | undefined
                ) === account.address
            );

            if (alreadyExists) {
              return existing;
            }

            return {
              ...existing,
              items: [
                {
                  __typename: "GroupMember",
                  account: toReference(account) ?? account
                },
                ...existing.items
              ]
            };
          },
          groupStats(existing, { readField }) {
            if (!existing) {
              return existing;
            }

            const currentTotal = readField("totalMembers", existing) as number;

            return {
              ...existing,
              totalMembers: currentTotal + 1
            };
          }
        }
      });
    },
    [client]
  );

  const onCompleted = (account: AccountFragment, isApproval: boolean) => {
    updateCache(account, isApproval);
    setIsSubmitting(null);
    toast.success(isApproval ? "Request approved" : "Request rejected");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(null);
    errorToast(error);
  }, []);

  const [approveRequest] = useApproveGroupMembershipRequestsMutation({
    onError
  });
  const [rejectRequest] = useRejectGroupMembershipRequestsMutation({
    onError
  });

  const handleApprove = async (account: AccountFragment) => {
    setIsSubmitting(account.address);

    const result = await approveRequest({
      variables: {
        request: {
          accounts: [account.address],
          group: groupAddress
        }
      }
    });

    const transactionData = result.data?.approveGroupMembershipRequests;

    if (!transactionData) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERRORS.SomethingWentWrong
      });
    }

    if (
      transactionData.__typename === "ApproveGroupMembershipRequestsResponse"
    ) {
      return onCompleted(account, true);
    }

    if (transactionData.__typename === "GroupOperationValidationFailed") {
      return onError({
        message: transactionData.reason,
        name: transactionData.__typename
      });
    }

    return await handleTransactionLifecycle({
      onCompleted: () => onCompleted(account, true),
      onError,
      transactionData
    });
  };

  const handleReject = async (account: AccountFragment) => {
    setIsSubmitting(account.address);

    const result = await rejectRequest({
      variables: {
        request: {
          accounts: [account.address],
          group: groupAddress
        }
      }
    });

    const transactionData = result.data?.rejectGroupMembershipRequests;

    if (!transactionData) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERRORS.SomethingWentWrong
      });
    }

    if (
      transactionData.__typename === "RejectGroupMembershipRequestsResponse"
    ) {
      return onCompleted(account, false);
    }

    return await handleTransactionLifecycle({
      onCompleted: () => onCompleted(account, false),
      onError,
      transactionData
    });
  };

  if (loading) {
    return <AccountListShimmer />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load membership requests"
      />
    );
  }

  if (!requests?.length) {
    return (
      <EmptyState
        className="text-sm"
        hideCard
        icon={<UsersIcon className="size-8" />}
        message="Group doesn't have any membership requests."
      />
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtualizer>
        {requests.map((request, index) => (
          <motion.div
            animate="visible"
            className={cn(
              "divider flex items-center justify-between gap-x-4 p-5",
              index === requests.length - 1 && "border-b-0"
            )}
            initial="hidden"
            key={request.account.address}
            variants={accountsList}
          >
            <div className="min-w-0 flex-1">
              <SingleAccount
                account={request.account}
                hideFollowButton
                hideUnfollowButton
                showUserPreview
              />
            </div>
            {isSubmitting === request.account.address ? (
              <Loader className="mr-1" small />
            ) : (
              <div className="flex shrink-0 items-center gap-x-2">
                <Button
                  disabled={Boolean(isSubmitting)}
                  onClick={() => handleApprove(request.account)}
                  outline
                  size="sm"
                >
                  Approve
                </Button>
                <Button
                  disabled={Boolean(isSubmitting)}
                  onClick={() => handleReject(request.account)}
                  outline
                  size="sm"
                >
                  Reject
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
      </Virtualizer>
    </div>
  );
};

export default Requests;
