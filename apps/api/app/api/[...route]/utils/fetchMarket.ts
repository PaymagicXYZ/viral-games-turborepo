export const fetchMarket = async (
  address: string
): Promise<{
  chain: string;
  collateralAddress: string;
  ogImageURI: string | null;
  title: string;
  provider: string;
  chain_id: number;
  <T>(arg0: string): T;
}> => {
  const marketData = await fetch(
    `https://api.limitless.exchange/markets/${address}`
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error(error);
    });

  return {
    ...marketData,
    collateralAddress: marketData.collateralToken.address,
    chain: "base",
    chain_id: 8453,
    provider: "limitless",
  };
};
