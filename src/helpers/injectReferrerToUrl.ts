import { HEY_TREASURY } from "@/data/constants";

interface DomainParamConfig {
  name: string;
  value: string;
}

const DOMAIN_PARAM_MAP: Record<string, DomainParamConfig> = {
  "highlight.xyz": { name: "referrer", value: HEY_TREASURY },
  "zora.co": { name: "referrer", value: HEY_TREASURY }
};

const isDomainMatch = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const injectReferrerToUrl = (url: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

  const [, config] =
    Object.entries(DOMAIN_PARAM_MAP).find(([domain]) =>
      isDomainMatch(hostname, domain)
    ) || [];

  if (!config) {
    return url;
  }

  parsed.searchParams.set(config.name, config.value);
  return parsed.toString();
};

export default injectReferrerToUrl;
