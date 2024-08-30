/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { neynar as neynarHub } from 'frog/hubs';
import { neynar } from 'frog/middlewares';
import { handle } from 'frog/next';
import { serveStatic } from 'frog/serve-static';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type Address, erc20Abi, getAddress, parseUnits } from 'viem';
import { ApproveBetPromptScreen } from '../components/ApproveBetPromptScreen';
import { InitialScreen } from '../components/InitialScreen';
import { PaidBetPromptScreen } from '../components/PaidBetPromptScreen';
import { SuccessScreen } from '../components/SuccessScreen';
import { getViemClient } from './queries';

import { Tables } from '@/lib/types/supabase';
import { Token, TradeQuotes } from '@/lib/types/limitless';
import { buyShares, getTempPlayer } from '@/lib/actions/viral-games-api';
import { defaultChain } from '@/lib/constants';
import { fixedProductMarketMakerABI } from '@/abis/fixedProductMakerABI';
import { Market, MarketGroupResponse } from '@/lib/types/markets';
import { insertActivity } from '@/lib/actions/supabase/activities';
import { env } from '@/lib/config/env';

const DEFAULT_BET_SIZE = 10;
const apiUrl = env.NEXT_PUBLIC_VIRAL_GAMES_BE_API;
const limitlessApiUrl = env.NEXT_PUBLIC_LIMITLESS_API_URL;
const neynarMiddleware = neynar({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  apiKey: env.NEYNAR_API_KEY,
  features: ['interactor'],
});
const app = new Frog<{
  State: {
    market: { market: Market; metadata: Tables<'markets_metadata'> };
    collateralToken: Token;
    addressOfMarket: Address;
    hasUsedFreeBet: boolean;
    accountToInvestmentAmountRaw?: string | undefined;
    quote?: TradeQuotes | undefined | null;
    outcomeIndex?: number | undefined;
  };
}>({
  title: '',
  assetsPath: '/',
  basePath: '/markets/frames',
  imageAspectRatio: '1:1',
  hub:
    process.env.NODE_ENV === 'production'
      ? // biome-ignore lint/style/noNonNullAssertion: <explanation>
        neynarHub({ apiKey: env.NEYNAR_API_KEY! })
      : undefined,
  verify: process.env.NODE_ENV === 'production' ? true : 'silent',
  imageOptions: async () => {
    const localFont = await readFile(
      path.join(process.cwd(), '/public/fonts/PressStart2P.ttf'),
    );

    return {
      fonts: [
        {
          name: 'PressStart',
          data: localFont,
        },
      ],
      width: 616,
      height: 616,
    };
  },
  // @ts-ignore
  initialState: async (c) => {
    // We always expect that `c.req.param('address')` is not null.
    // Therefore, all the routes must have `/:address` path parameter.
    // See how `initialState` is used: https://www.youtube.com/watch?v=jFhe-WLm0C8&t=1s

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    // const addressOfMarket = getAddress(c.req.param('address')!);
    // console.log("PARAMS IN ROUTE", c.req.param());
    const marketProvider = c.req.param('provider');
    const marketId =
      marketProvider === 'limitless'
        ? // biome-ignore lint/style/noNonNullAssertion: <explanation>
          getAddress(c.req.param('address')!)
        : c.req.param('address');
    const marketData = await fetch(
      `${apiUrl}/markets/${marketProvider}/${marketId}`,
      {
        method: 'GET',
      },
    );

    // @NOTE: the type of the `market` here was defined as `Market | null` before. Please check.
    const marketRes = (await marketData.json()) as MarketGroupResponse;
    const market = marketRes.data[0];
    const marketMetadata = marketRes.metadata;
    let token = {} as Pick<Token, 'address' | 'decimals' | 'symbol'>;

    if (marketProvider === 'limitless') {
      const tokenData = await fetch(`${limitlessApiUrl}/tokens`, {
        method: 'GET',
      });
      const tokensResponse: Token[] = await tokenData.json();
      token = tokensResponse.find(
        (token) =>
          token.address.toLowerCase() ===
          market.collateralToken.address.toLowerCase(),
      ) as Token;
    } else {
      token = {
        address: market.collateralToken.address as Address,
        decimals: market.collateralToken.decimals,
        symbol: market.collateralToken.symbol,
      };
    }

    return {
      market: { market, metadata: marketMetadata },
      collateralToken: token,
      addressOfMarket: marketId,
    };
  },
});

// Note: The following flow is for user free bets
app
  .frame('/initial/:provider/:address', async (c) => {
    const { market, collateralToken, addressOfMarket } = c.previousState;
    const provider = c.req.param('provider');
    return c.res({
      browserLocation: `${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${provider}/${addressOfMarket}`,
      action: `/paid-bet/${c.req.param('provider')}/${c.req.param('address')}`,
      image: `/initial/${c.req.param('provider')}/${c.req.param('address')}/img`,
      intents: [
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button value='buyYes'>Yes</Button>,
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button value='buyNo'>No</Button>,
        // eslint-disable-next-line react/jsx-key
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Link
          href={`${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${provider}/${addressOfMarket}`}
        >
          Open Viral.games
        </Button.Link>,
      ],
      title: market.metadata.title,
    });
  })
  .image('/initial/:provider/:address/img', (c) => {
    // @ts-ignore
    const { market, collateralToken } = c.previousState;
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <InitialScreen
          marketTitle={market.market.title}
          collateralSymbol={collateralToken.symbol}
          imageUrl={market.market.ogImageURI}
        />
      ),
    });
  });

app.frame('/paid-bet/:provider/:address', neynarMiddleware, async (c) => {
  const { market, collateralToken, addressOfMarket } = c.previousState;
  const freeBetValue = c.buttonValue;
  const _provider = c.req.param('provider');
  if (!c.var.interactor?.fid) {
    return c.error({ message: 'No interactor found' });
  }

  c.deriveState((prevState) => {
    prevState.outcomeIndex = freeBetValue === 'buyYes' ? 0 : 1;
  });

  const player = await getTempPlayer({
    user_address: c.var.interactor.fid.toString(),
    provider: 'farcaster',
  });

  if (player && player.balance >= DEFAULT_BET_SIZE) {
    // TODO: handle different marketId for multi-choice bets
    const { error } = await buyShares({
      marketId: addressOfMarket,
      eventId: addressOfMarket,
      position: freeBetValue === 'buyYes' ? 'Yes' : 'No',
      amount: DEFAULT_BET_SIZE,
      socialProvider: 'farcaster',
      userId: c.var.interactor.fid.toString(),
      provider: _provider as 'limitless' | 'polymarket',
    });

    if (!error) {
      c.deriveState((prevState) => {
        prevState.hasUsedFreeBet = true;
      });
    }
  }
  const button =
    _provider === 'polymarket' ? (
      <Button.Reset>Back</Button.Reset>
    ) : (
      <Button>Next</Button>
    );
  return c.res({
    browserLocation: `${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${c.req.param('provider')}/${addressOfMarket}`,
    action: `/approve/${c.req.param('provider')}/${c.req.param('address')}`,
    image: `/paid-bet/${c.req.param('provider')}/${c.req.param('address')}/img`,
    intents: [
      // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
      _provider === 'limitless' && (
        <TextInput placeholder={`Enter amount ${collateralToken.symbol}`} />
      ),
      button,
    ],
    title: market.metadata.title,
  });
});

app.image('/paid-bet/:provider/:address/img', (c) => {
  // @ts-ignore
  const { market, collateralToken, hasUsedFreeBet } = c.previousState;
  return c.res({
    headers: {
      'Cache-Control': 'max-age=0',
    },
    image: (
      <PaidBetPromptScreen
        marketTitle={market.metadata.title}
        collateralSymbol={collateralToken.symbol}
        hasUsedFreeBet={hasUsedFreeBet}
        iconSrc={hasUsedFreeBet ? '/frames/success_icon.png' : undefined}
        imageUrl={market.market.ogImageURI}
      />
    ),
  });
});

app
  .frame('/approve/:provider/:address', async (c) => {
    const {
      // @ts-ignore
      inputText,
    } = c;
    if (!inputText) return c.error({ message: 'No text input!' });
    const { market, addressOfMarket } = await c.deriveState(
      async (previousState) => {
        // console.log({ previousState, inputText });
        const accountToInvestmentAmountRaw = inputText;
        previousState.accountToInvestmentAmountRaw =
          accountToInvestmentAmountRaw;
      },
    );

    return c.res({
      action: `/buy/${c.req.param('provider')}/${c.req.param('address')}`,
      image: `/approve/${c.req.param('provider')}/${c.req.param('address')}/img`,
      intents: [
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Transaction
          target={`/approve-tx/${c.req.param('provider')}/${c.req.param('address')}`}
        >
          Approve Transaction
        </Button.Transaction>,
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Link
          href={`${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${c.req.param('provider')}/${addressOfMarket}`}
        >
          Open Viral.games
        </Button.Link>,
      ],
      title: market.metadata.title,
    });
  })
  .image('/approve/:provider/:address/img', (c) => {
    // @ts-ignore
    const { quote, collateralToken, accountToInvestmentAmountRaw, market } =
      c.previousState;
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <ApproveBetPromptScreen
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          amount={accountToInvestmentAmountRaw!}
          collateralSymbol={collateralToken.symbol}
          marketTitle={market.metadata.title}
          subtitle={`You are going to approve ${accountToInvestmentAmountRaw} ${collateralToken.symbol} for betting on
					the outcome below`}
          title={`Approve ${accountToInvestmentAmountRaw} ${collateralToken.symbol}?`}
          imageUrl={market.market.ogImageURI}
        />
      ),
    });
  });

app.transaction('/approve-tx/:provider/:address', async (c) => {
  const { addressOfMarket, collateralToken, accountToInvestmentAmountRaw } =
    c.previousState;

  if (!accountToInvestmentAmountRaw)
    return c.error({ message: 'No text input!' });

  const accountToInvestmentAmountBI = parseUnits(
    accountToInvestmentAmountRaw,
    collateralToken?.decimals || 18,
  );
  return c.contract({
    abi: erc20Abi,
    functionName: 'approve',
    args: [addressOfMarket as Address, accountToInvestmentAmountBI],
    chainId: `eip155:${defaultChain.id}`,
    to: collateralToken?.address as Address,
  });
});

app
  .frame('/buy/:provider/:address', (c) => {
    const { addressOfMarket, market } = c.previousState;
    // console.log("INPUT FROM BUY SCREEN", c.inputText);
    return c.res({
      image: `/buy/${c.req.param('provider')}/${c.req.param('address')}/img`,
      action: `/success/${c.req.param('provider')}/${c.req.param('address')}`,
      intents: [
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Transaction
          target={`/buy-tx/${c.req.param('provider')}/${c.req.param('address')}`}
        >
          Buy
        </Button.Transaction>,
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Link
          href={`${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${c.req.param('provider')}/${addressOfMarket}`}
        >
          Open Viral.games
        </Button.Link>,
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Reset>Reset</Button.Reset>,
      ],
      title: market?.metadata.title,
    });
  })
  .image('/buy/:provider/:address/img', (c) => {
    // @ts-ignore
    const { quote, collateralToken, accountToInvestmentAmountRaw, market } =
      c.previousState;
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <ApproveBetPromptScreen
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          amount={accountToInvestmentAmountRaw!}
          collateralSymbol={collateralToken.symbol}
          marketTitle={market.metadata.title}
          subtitle={`You are going to bet ${accountToInvestmentAmountRaw} ${collateralToken.symbol} on
			the outcome below`}
          title={`${accountToInvestmentAmountRaw} ${collateralToken.symbol} approved`}
          imageUrl={market.market.ogImageURI}
        />
      ),
    });
  });

app.transaction('/buy-tx/:provider/:address', async (c) => {
  const {
    addressOfMarket,
    collateralToken,
    outcomeIndex,
    accountToInvestmentAmountRaw,
  } = c.previousState;
  if (outcomeIndex === undefined || accountToInvestmentAmountRaw === undefined)
    return c.error({ message: 'Insufficient parameters' });
  const client = getViemClient();

  const accountToInvestmentAmountBI = parseUnits(
    accountToInvestmentAmountRaw,
    collateralToken?.decimals || 18,
  );

  const minOutcomeTokensToBuy = await client.readContract({
    address: addressOfMarket as Address,
    abi: fixedProductMarketMakerABI,
    functionName: 'calcBuyAmount',
    args: [accountToInvestmentAmountBI, outcomeIndex],
  });

  return c.contract({
    abi: fixedProductMarketMakerABI,
    functionName: 'buy',
    args: [accountToInvestmentAmountBI, outcomeIndex, minOutcomeTokensToBuy],
    chainId: `eip155:${defaultChain.id}`,
    to: addressOfMarket as Address,
  });
});

app
  .frame('/success/:provider/:address', neynarMiddleware, async (c) => {
    const {
      addressOfMarket,
      market,
      accountToInvestmentAmountRaw,
      collateralToken,
      outcomeIndex,
    } = c.previousState;
    if (!c.transactionId || !c.var.interactor?.fid) {
      return c.res({
        image: '/frames/tx_error.png',
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        intents: [<Button.Reset>Try Again</Button.Reset>],
      });
    }

    // Note: We need to get the address from the tx receipt but that will increase loading time. We are using the verified address for now.
    insertActivity({
      activity: {
        user_address:
          c.var.interactor.verifiedAddresses?.ethAddresses?.[0] ?? '',
        market_address: addressOfMarket,
        market_title: market.metadata.title,
        asset_ticker: collateralToken.symbol,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        tx_value: accountToInvestmentAmountRaw!,
        tx_hash: c.transactionId,
        chain: 'base',
        chain_id: 8453,
        market_uri: market.metadata.image_uri,
        strategy: 'buy',
        provider: 'farcaster',
        outcome_index: outcomeIndex as 0 | 1,
        outcome_index_formatted: outcomeIndex === 0 ? 'Yes' : 'No',
      },
    });

    return c.res({
      browserLocation: `${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${c.req.param('provider')}/${addressOfMarket}`,
      image: `/success/${c.req.param('provider')}/${c.req.param('address')}/img`,
      intents: [
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Link
          href={`${env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/${c.req.param('provider')}/${addressOfMarket}`}
        >
          Open Viral.games
        </Button.Link>,
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        <Button.Reset>Back</Button.Reset>,
      ],
    });
  })
  .image('/success/:provider/:address/img', (c) => {
    const { accountToInvestmentAmountRaw, collateralToken, market } = c.previousState;
    return c.res({
      headers: {
        'Cache-Control': 'max-age=0',
      },
      image: (
        <SuccessScreen
          amount={accountToInvestmentAmountRaw ?? '0'}
          collateralSymbol={collateralToken.symbol}
          imageUrl={market.market.ogImageURI}
        />
      ),
    });
  });

devtools(app, {
  basePath: '/debug', // devtools available at `http://localhost:5173/debug`
  serveStatic,
});

export const GET = handle(app);
export const POST = handle(app);
