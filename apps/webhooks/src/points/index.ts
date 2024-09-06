import {
  isAddress,
  getContract,
  createWalletClient,
  http,
  Chain,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { spicy, hederaTestnet, rootstock, rootstockTestnet } from "viem/chains";
import { viralPointsAbi } from "./abi/viral-points";
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";

import dotenv from "dotenv";
dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const VIRAL_POINTS_CONTRACT_ADDRESS =
  "0x8a7285a15a2514442d7592545dc89454e3378cca";
export interface Activities {
  id: number;
  created_at: string; // ISO date string
  user_address: string;
  market_address: string;
  outcome_index: number;
  strategy: string;
  tx_hash: string;
  tx_value: string; // Could be a number if strictly numeric
  asset_ticker: string;
  market_uri: string;
  market_title: string;
  pfp: string; // URL to profile picture
  ens: string; // ENS name
  chain: string;
  outcome_index_formatted: string | null; // Nullable string
  provider: string;
  chain_id: number;
}
export async function handleActivity(webhookObject: any) {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in the environment variables.");
  } else if (
    !webhookObject ||
    webhookObject.type !== "INSERT" ||
    webhookObject.table !== "activities" ||
    !webhookObject.record
  ) {
    throw new Error("webhookObject is not in the correct format.");
  }

  // User
  const adminWallet = privateKeyToAccount(PRIVATE_KEY);
  const user = webhookObject.record.user_address;

  // Sign Attestation
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.baseSepolia,
    account: adminWallet,
  });
  const marketTitle = webhookObject.record.market_title;
  const betAction =
    webhookObject.record.strategy.charAt(0).toUpperCase() +
    webhookObject.record.strategy.slice(1);
  const betOutcome = webhookObject.record.outcome_index ? "Yes" : "No";
  const betTotal =
    webhookObject.record.tx_value + " " + webhookObject.record.asset_ticker;
  const signAttestationResult = await client.createAttestation({
    schemaId: "0x1a6",
    data: {
      user,
      marketTitle,
      betAction,
      betOutcome,
      betTotal,
    },
    indexingValue: user.toLowerCase(),
  });
  console.log("Sign Attestation Result:", signAttestationResult);

  // Mints $POINTS to the user address
  const userEvmAddress = await getUserEvmAddress(user);

  if (userEvmAddress) {
    // Mint $POINTS
    const allChains: Chain[] = [
      spicy,
      hederaTestnet,
      rootstockTestnet,
      heliumTestnet,
    ];
    for (let chain of allChains) {
      const client = createWalletClient({
        account: adminWallet,
        chain: chain,
        transport: http(),
      });

      const viralPointsContract = getContract({
        address: VIRAL_POINTS_CONTRACT_ADDRESS,
        abi: viralPointsAbi,
        client: client,
      });

      // Mint 10 points to the user
      const mintTx = await viralPointsContract.write.mint([
        userEvmAddress,
        10 * 10 ** 18,
      ]);
      console.log("Mint transaction:", mintTx);
    }
  }
}

async function getUserEvmAddress(user: string): Promise<string> {
  // Strip 'eoa:' prefix if it exists
  user = user.startsWith("eoa:") ? user.replace("eoa:", "") : user;
  if (isAddress(user, { strict: false })) {
    return user;
  }
  // Resolve patch wallet address from user
  const userPass = user.startsWith("youtube:")
    ? user.replace("youtube:", "google:")
    : user;
  const patchWalletResponse = await fetch(
    "https://paymagicapi.com/v1/resolver",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds: userPass }),
    }
  );

  if (!patchWalletResponse.ok) {
    return "";
  }

  const data = await patchWalletResponse.json();
  const users = data.users;

  if (Array.isArray(users) && users.length > 0) {
    return users[0].accountAddress || "";
  }

  return "";
}

const heliumTestnet = defineChain({
  id: 8008135,
  name: "Helium Testnet",
  network: "helium-testnet",
  nativeCurrency: {
    name: "Helium Testnet Token",
    symbol: "tFHE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://api.helium.fhenix.zone"],
    },
  },
  blockExplorers: {
    default: {
      name: "Helium Explorer",
      url: "https://explorer.helium.fhenix.zone",
    },
  },
});
