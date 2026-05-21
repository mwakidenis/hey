import { chains } from "@lens-chain/sdk/viem";
import { CONTRACTS } from "./contracts";

export const CHAIN = chains.mainnet;

// Lens and Hey Env Config
export const LENS_API_URL = "https://api.lens.xyz/graphql";
export const DEFAULT_COLLECT_TOKEN = CONTRACTS.defaultToken;
export const HEY_APP = CONTRACTS.app;
export const HEY_TREASURY = "0x03Ba34f6Ea1496fa316873CF8350A3f7eaD317EF";
export const ADDRESS_PLACEHOLDER = "0x03Ba3...7EF";

// Application
export const BRAND_COLOR = "#FB3A5D";

// URLs
export const STATIC_ASSETS_URL = "https://static.hey.xyz";
export const STATIC_IMAGES_URL = `${STATIC_ASSETS_URL}/images`;
export const LENS_MEDIA_SNAPSHOT_URL = "https://ik.imagekit.io/lens";
export const DEFAULT_AVATAR = `${STATIC_IMAGES_URL}/default.png`;
export const PLACEHOLDER_IMAGE = `${STATIC_IMAGES_URL}/placeholder.webp`;
export const BLOCK_EXPLORER_URL = "https://lenscan.io";
export const BASE_RPC_URL = "https://base.llamarpc.com";

// Storage
export const STORAGE_NODE_URL = "https://api.grove.storage";
export const IPFS_GATEWAY = "https://gw.ipfs-lens.dev/ipfs";

// Tokens / Keys
export const WALLETCONNECT_PROJECT_ID = "cd542acc70c2b548030f9901a52e70c8";
export const GIPHY_KEY = "yNwCXMKkiBrxyyFduF56xCbSuJJM8cMd"; // Read only safe key

export const LENS_NAMESPACE = "lens/";
export const NATIVE_TOKEN_SYMBOL = "GHO";
export const WRAPPED_NATIVE_TOKEN_SYMBOL = "WGHO";

export const MAX_IMAGE_UPLOAD = 8;

// Named transforms for ImageKit
export const TRANSFORMS = {
  ATTACHMENT: "tr:w-1000",
  AVATAR_BIG: "tr:w-350,h-350",
  AVATAR_SMALL: "tr:w-100,h-100",
  AVATAR_TINY: "tr:w-50,h-50",
  COVER: "tr:w-1350,h-350",
  EXPANDED_AVATAR: "tr:w-1000,h-1000"
};
