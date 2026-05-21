import { sendEip712Transaction, sendTransaction } from "viem/zksync";
import { useConfig } from "wagmi";
import { getAccount, getWalletClient } from "wagmi/actions";
import { CHAIN } from "@/data/constants";
import { ERROR_NAMES, ERRORS } from "@/data/errors";
import getTransactionData from "@/helpers/getTransactionData";
import type {
  SelfFundedTransactionRequestFragment,
  SponsoredTransactionRequestFragment,
  TransactionWillFailFragment
} from "@/indexer/generated";
import type { ApolloClientError } from "@/types/errors";
import useHandleWrongNetwork from "./useHandleWrongNetwork";

type AnyTransactionRequestFragment =
  | SelfFundedTransactionRequestFragment
  | SponsoredTransactionRequestFragment
  | TransactionWillFailFragment
  | { __typename?: string; hash?: unknown }
  | ((...args: never[]) => unknown);

const useTransactionLifecycle = () => {
  const handleWrongNetwork = useHandleWrongNetwork();
  const config = useConfig();

  const getActiveWalletClient = async (
    transactionType: string,
    onError: (error: ApolloClientError) => void
  ) => {
    if (!getAccount(config).isConnected) {
      onError({
        message: ERRORS.SignWallet,
        name: transactionType
      });
      return null;
    }

    await handleWrongNetwork();

    const walletClient = await getWalletClient(config, {
      chainId: CHAIN.id
    }).catch(() => null);

    if (!walletClient) {
      onError({
        message: ERRORS.SignWallet,
        name: transactionType
      });
      return null;
    }

    return walletClient;
  };

  const handleSponsoredTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    onError: (error: ApolloClientError) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SponsoredTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }

    const walletClient = await getActiveWalletClient(
      transactionData.__typename,
      onError
    );

    if (!walletClient) {
      return;
    }

    return onCompleted(
      await sendEip712Transaction(walletClient, {
        account: walletClient.account,
        ...getTransactionData(transactionData.raw, { sponsored: true })
      })
    );
  };

  const handleSelfFundedTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    onError: (error: ApolloClientError) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SelfFundedTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }

    const walletClient = await getActiveWalletClient(
      transactionData.__typename,
      onError
    );

    if (!walletClient) {
      return;
    }

    return onCompleted(
      await sendTransaction(walletClient, {
        account: walletClient.account,
        ...getTransactionData(transactionData.raw)
      })
    );
  };

  const handleTransactionLifecycle = async ({
    transactionData,
    onCompleted,
    onError
  }: {
    transactionData: AnyTransactionRequestFragment;
    onCompleted: (hash: string) => void;
    onError: (error: ApolloClientError) => void;
  }) => {
    try {
      if (typeof transactionData === "function") {
        return onError({
          message: ERRORS.SomethingWentWrong,
          name: ERROR_NAMES.UnknownError
        });
      }
      switch (transactionData.__typename) {
        case "SponsoredTransactionRequest":
          return await handleSponsoredTransaction(
            transactionData,
            onCompleted,
            onError
          );
        case "SelfFundedTransactionRequest":
          return await handleSelfFundedTransaction(
            transactionData,
            onCompleted,
            onError
          );
        case "TransactionWillFail":
          if ("reason" in transactionData) {
            return onError({
              message: transactionData.reason,
              name: transactionData.__typename
            });
          }
          return onError({
            message: ERRORS.SomethingWentWrong,
            name: ERROR_NAMES.UnknownError
          });
        default:
          onError({
            message: ERRORS.SomethingWentWrong,
            name: ERROR_NAMES.UnknownError
          });
          return;
      }
    } catch (error) {
      return onError(error as ApolloClientError);
    }
  };

  return handleTransactionLifecycle;
};

export default useTransactionLifecycle;
