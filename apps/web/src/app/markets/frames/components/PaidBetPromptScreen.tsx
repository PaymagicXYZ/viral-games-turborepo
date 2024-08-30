/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { TextWrapper } from './TextWrapper';

export const PaidBetPromptScreen = ({
  marketTitle,
  collateralSymbol,
  iconSrc,
  hasUsedFreeBet,
  imageUrl
}: {
  marketTitle: string;
  collateralSymbol: string;
  iconSrc?: string;
  hasUsedFreeBet?: boolean;
  imageUrl?: string | null
}) => {
  return (
    <div
      style={{
        height: 616,
        width: 616,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        textAlign: 'center',
        flexWrap: 'nowrap',
        fontFamily: 'Superstar',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      <img
        src={imageUrl ?? '/frames/default.png'}
        width={'100%'}
        alt='Confirm Country'
        style={{
          position: 'absolute',
        }}
      />
      <TextWrapper imageSrc={iconSrc}>
        <div style={{ fontSize: 20, margin: 14 }}>
          {getTitle(!!hasUsedFreeBet)}
        </div>
        <div style={{ fontSize: 14, display: 'flex', lineHeight: 2 }}>
          Do you want to bet {collateralSymbol} on this outcome below ?
        </div>
        <TextWrapper fontSize={14} containerPadding={0}>
          {marketTitle}
        </TextWrapper>
      </TextWrapper>
    </div>
  );
};

const getTitle = (hasUsedFreeBet: boolean) => {
  if (!hasUsedFreeBet) {
    return "You don't have any free bets left";
  }
  return 'Congrats on placing a bet!';
};
