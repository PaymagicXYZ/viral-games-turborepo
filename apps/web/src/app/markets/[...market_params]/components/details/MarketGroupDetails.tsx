import { Label } from '@/components/ui/label';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import Image from 'next/image';
import Link from 'next/link';
import { isAddress } from 'viem';
import MarketChart from './MarketChart';
import MarketOutcome from './MarketOutcome';
import MarketPositions from './MarketPositions';
import { MarketGroupResponse } from '@/lib/types/markets';

type MarketDetailsProps = {
  marketGroup: MarketGroupResponse;
};

export default function MarketGroupDetails({
  marketGroup,
}: MarketDetailsProps) {
  const market = marketGroup.data?.[0];

  return (
    <section className='flex w-full flex-col gap-10 border-2 border-black p-5 shadow-sm lg:min-h-[1041px] lg:max-w-[75%]'>
      <MarketTags tags={market?.tags} />
      <div className='flex flex-col items-center gap-4 lg:flex-row'>
        <MarketImage
          src={
            market.ogImageURI ??
            marketGroup.metadata?.image_uri ??
            '/viral-game/market-thumbnail.svg'
          }
        />
        <div className='flex h-full flex-col justify-between py-2'>
          <MarketTitle title={marketGroup.metadata.title} />
          <MarketCreator creator={market.creator} />
        </div>
      </div>
      <div className='flex flex-col flex-wrap gap-4 lg:flex-row'>
        <MarketExpiresAt expiresAt={market.expirationDate} />
        <MarketVolume
          volumeFormatted={market.volumeFormatted}
          tokenSymbol={market.collateralToken.symbol}
        />
        <MarketLiquidity
          liquidityFormatted={market.liquidityFormatted}
          tokenSymbol={market.collateralToken.symbol}
        />
      </div>
      {/* <MarketOutcome marketGroup={marketGroup} /> */}
      {isAddress(market.id) && <MarketChart market={market} />}
      <MarketDescription description={market.description} />

      <MarketPositions
        marketIdentifier={
          marketGroup.metadata?.market_identifier ??
          marketGroup.metadata?.title ??
          ''
        }
        prices={market.outcomePrices}
        tokenSymbol={market.collateralToken.symbol}
      />
    </section>
  );
}

type MarketTagsProps = {
  tags?: Array<string> | null;
};

function MarketTags({ tags }: MarketTagsProps) {
  return (
    <div className='flex flex-wrap gap-4'>
      {tags?.map((tag, idx) => (
        <div key={idx} className='bg-gray-200 px-2 py-1'>
          <Label className='text-xs text-gray-500'>#{tag}</Label>
        </div>
      ))}
    </div>
  );
}

type MarketImageProps = {
  src: string | null;
};

function MarketImage({ src }: MarketImageProps) {
  return (
    <div className='relative h-auto w-full lg:h-[200px] lg:w-[300px]'>
      <Image
        src={src ?? '/viral-game/app-logo.png'}
        alt='market-image'
        fill
        sizes='100vw'
      />
    </div>
  );
}

type MarketCreatorProps = {
  creator: {
    name: string;
    imageURI?: string;
    link?: string;
  } | null;
};

function MarketCreator({ creator }: MarketCreatorProps) {
  return (
    <div className='flex items-center gap-4'>
      {creator?.imageURI && (
        <Image
          src={creator.imageURI}
          alt='creator-uri'
          width={0}
          height={0}
          className='h-[40px] w-[40px]'
          sizes='100vw'
        />
      )}
      <Label>{creator?.name}</Label>
      {/* TODO: Check if link is warpcast before opening warpcast... */}
      {creator?.link && (
        <Link href={creator.link} target='_blank'>
          <Image
            src='/warpcast_icon.png'
            alt='warpcast-logo'
            width={20}
            height={20}
          />
        </Link>
      )}
    </div>
  );
}

type MarketTitleProps = {
  title: string | null;
};

function MarketTitle({ title }: MarketTitleProps) {
  return (
    <div>
      <Label className='text-base'>{title}</Label>
    </div>
  );
}

type MarketExpiresAtProps = {
  expiresAt: string;
};

function MarketExpiresAt({ expiresAt }: MarketExpiresAtProps) {
  return (
    <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
      <Label className='text-xs text-gray-500'>Expires At</Label>
      <Label className='text-xs text-gray-500'>{expiresAt}</Label>
    </div>
  );
}

type MarketVolumeProps = {
  volumeFormatted: string | null;
  tokenSymbol: string | null;
};

function MarketVolume({ volumeFormatted, tokenSymbol }: MarketVolumeProps) {
  return (
    <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
      <Label className='text-xs text-gray-500'>Volume</Label>

      <div className='flex items-center gap-1'>
        <Label className='text-xs text-gray-500'>
          {NumberUtil.formatThousands(volumeFormatted ?? '0', 2)}
        </Label>
        <Label className='text-xs text-gray-500'>{tokenSymbol}</Label>
      </div>
    </div>
  );
}

function MarketLiquidity({
  liquidityFormatted,
  tokenSymbol,
}: {
  liquidityFormatted: string;
  tokenSymbol: string | null;
}) {
  return (
    <div className='flex flex-col justify-center gap-2 bg-gray-200 px-2 py-1'>
      <Label className='text-xs text-gray-500'>Liquidity</Label>

      <div className='flex items-center gap-1'>
        <Label className='text-xs text-gray-500'>
          {NumberUtil.formatThousands(liquidityFormatted ?? '0', 2)}
        </Label>
        <Label className='text-xs text-gray-500'>{tokenSymbol}</Label>
      </div>
    </div>
  );
}

type MarketDescriptionProps = {
  description: string;
};

function MarketDescription({ description }: MarketDescriptionProps) {
  return (
    <div className='flex flex-col gap-2'>
      <Label className='text-gray-500'>Description</Label>
      <Label className='text-sm'>{description}</Label>
    </div>
  );
}
