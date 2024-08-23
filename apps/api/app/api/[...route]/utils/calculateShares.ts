import { SupportedChain, getClient } from "./viem";

export const abi = [
  {
    constant: true,
    inputs: [
      { name: "investmentAmount", type: "uint256" },
      { name: "outcomeIndex", type: "uint256" },
    ],
    name: "calcBuyAmount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

export const calculateShares = async (
  address: string,
  amount: number,
  position: "Yes" | "No",
  collateralAddress: string,
  chain: SupportedChain
): Promise<number> => {
  const client = getClient(chain);
  let convertedAmount = amount;
  if (collateralAddress !== "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") {
    const url = `https://pro-api.coingecko.com/api/v3/coins/${chain}/contract/${collateralAddress}`;
    const options = {
      method: "GET",
      headers: { accept: "application/json" },
      "x-cg-pro-api-key": process.env.CG_API_KEY,
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        convertedAmount = amount / json.market_data.current_price.usd;
      })
      .catch((err) => console.error("error:" + err));
  }
  const shares = await client.readContract({
    address: address as `0x${string}`,
    abi,
    functionName: "calcBuyAmount",
    args: [BigInt(convertedAmount), BigInt(position === "Yes" ? 0 : 1)],
  });
  return Number(shares);
};
