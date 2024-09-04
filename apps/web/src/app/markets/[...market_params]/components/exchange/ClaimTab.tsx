import { useHistory } from '@/components/providers/HistoryProvider';
import { useTradingService } from '@/components/providers/TradingProvider';
import { Market } from '@/lib/types/markets';
import { Dispatch, SetStateAction, useState } from 'react';
import { Address } from 'viem';
import { ActionButton } from './MarketExchange';
import { Label } from '@/components/ui/label';
import { NumberUtil } from '@/lib/utils/limitless/NumberUtil';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Image from 'next/image';
import { useOutsideClick } from '@/lib/hooks/useOutsideClick';
import Confetti from '@/components/ui/confetti';

type ClaimTabProps = {
  market: Market;
};

export default function ClaimTab({ market }: ClaimTabProps) {
  const { redeem } = useTradingService();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const redeemPaidPosition = async () => {
    try {
      setIsRedeeming(true);

      await redeem({
        conditionId: market?.conditionId as Address,
        collateralAddress: market?.collateralToken.address as Address,
        marketAddress: market?.id as Address,
        outcomeIndex: market?.winningOutcomeIndex as number
      });

      setIsSuccessDialogOpen(true);
    } catch (err) {
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div>
      <Positions
        marketId={market.id}
        tokenSymbol={market.collateralToken.symbol}
      />
      <ActionButton
        label='Redeem'
        disabled={isRedeeming}
        withLoading={isRedeeming}
        onClick={redeemPaidPosition}
      />
      <SuccessfulClaimedDialog
        isOpen={isSuccessDialogOpen}
        setIsOpen={setIsSuccessDialogOpen}
      />
      <Confetti isActive={isSuccessDialogOpen} />
    </div>
  );
}

function Positions({
  marketId,
  tokenSymbol
}: {
  marketId: string;
  tokenSymbol: string;
}) {
  const { positions: allMarketsPositions } = useHistory();
  const positions = allMarketsPositions?.filter(
    (position) => position.market.id.toLowerCase() === marketId.toLowerCase()
  );

  return (
    <div className='flex flex-col gap-4 mb-4'>
      {positions?.map((position, idx) => (
        <Label key={idx}>
          Won ${NumberUtil.formatThousands(position.outcomeTokenAmount, 4)} $
          {tokenSymbol}
        </Label>
      ))}
    </div>
  );
}

function SuccessfulClaimedDialog({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const containerRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div>
      <Dialog open={isOpen}>
        <DialogContent ref={containerRef} className='z-50'>
          <DialogTitle />
          <DialogHeader>
            <DialogDescription className='flex flex-col items-center py-10 gap-6 text-black'>
              <Image
                src='/success-cone.png'
                alt='success-cone'
                width={200}
                height={220}
              />
              <Label className='text-lg'>Congrats</Label>
              <Label>You just claimed your reward!</Label>
              {/* <Button className='w-full flex items-center gap-2'>
              <Image
                src='/twitter_icon.png'
                alt='warpcast_icon'
                width={24}
                height={24}
              />
              <Label>Share on Twitter</Label>
            </Button>
            <Button className='w-full flex items-center gap-2'>
              <Image
                src='/warpcast_icon.png'
                alt='warpcast_icon'
                width={24}
                height={24}
              />
              <Label>Share on Farcaster</Label>
            </Button> */}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
