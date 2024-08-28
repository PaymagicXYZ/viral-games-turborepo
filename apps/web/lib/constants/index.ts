import { base } from 'viem/chains';

export const defaultChain = base;

export const newSubgraphURI = {
  [base.id]:
    process.env.NEXT_PUBLIC_SUBGRAPH_URL ??
    'https://indexer.bigdevenergy.link/da7c4d3/v1/graphql',
};

export const LIMIT_PER_PAGE = 100;
export const ONE_HOUR_IN_MILLISECONDS = 3_600_000; // milliseconds in an hour
