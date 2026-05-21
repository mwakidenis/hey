import type { Address } from "viem";
import type {
  AccountFollowRuleFragment,
  AccountFollowRules,
  GroupRuleFragment,
  GroupRules
} from "@/indexer/generated";
import getAnyKeyValue from "./getAnyKeyValue";

interface AssetDetails {
  assetAddress: Address | null;
  assetSymbol: string | null;
  amount: number | null;
}

const EMPTY_ASSET_DETAILS: AssetDetails = {
  amount: null,
  assetAddress: null,
  assetSymbol: null
};

const extractPaymentDetails = (
  rules: GroupRuleFragment[] | AccountFollowRuleFragment[]
): AssetDetails | null => {
  for (const rule of rules) {
    if (rule.type === "SIMPLE_PAYMENT") {
      return {
        amount:
          Number(getAnyKeyValue(rule.config, "amount")?.bigDecimal) || null,
        assetAddress:
          getAnyKeyValue(rule.config, "assetContract")?.address || null,
        assetSymbol: getAnyKeyValue(rule.config, "assetSymbol")?.string || null
      };
    }
  }

  return null;
};

export const getSimplePaymentDetails = (
  rules: GroupRules | AccountFollowRules
): AssetDetails =>
  extractPaymentDetails(rules.required) ??
  extractPaymentDetails(rules.anyOf) ??
  EMPTY_ASSET_DETAILS;
