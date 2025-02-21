import scaffoldConfig from "@/scaffold.config";
import { useGlobalState } from "@/store/globalStore";
import { AllowedChainIds } from "@/utils/scaffold-eth";

export function useSelectedNetwork(chainId?: AllowedChainIds) {
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);
  return scaffoldConfig.targetNetworks.find(targetNetwork => targetNetwork.id === chainId) ?? targetNetwork;
}
