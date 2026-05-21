import { useAccount, useSwitchChain } from "wagmi";
import { CHAIN } from "@/data/constants";

interface HandleWrongNetworkParams {
  chainId?: number;
}

const useHandleWrongNetwork = () => {
  const { chainId: activeChainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const handleWrongNetwork = async (params?: HandleWrongNetworkParams) => {
    const chainId = params?.chainId ?? CHAIN.id;

    if (!isConnected) {
      throw new Error("No active wallet connection found.");
    }

    if (activeChainId !== chainId) {
      await switchChainAsync({ chainId });
    }
  };

  return handleWrongNetwork;
};

export default useHandleWrongNetwork;
