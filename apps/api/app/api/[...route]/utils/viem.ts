import { createPublicClient, http } from "viem";
import { mainnet, polygon, base } from "viem/chains";

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const chains = ["mainnet", "polygon", "base"];

export type SupportedChain = (typeof chains)[number];

export const getClient = (chainName: SupportedChain) => {
  switch (chainName) {
    case "mainnet":
      return createPublicClient({
        chain: mainnet,
        transport: http(),
      });
    case "polygon":
      return createPublicClient({
        chain: polygon,
        transport: http(),
      });
    case "base":
      return createPublicClient({
        chain: base,
        transport: http(),
      });
    default:
      return client;
  }
};
