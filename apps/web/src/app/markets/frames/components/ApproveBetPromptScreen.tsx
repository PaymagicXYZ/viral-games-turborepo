/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { TextWrapper } from './TextWrapper';

export const ApproveBetPromptScreen = ({
  marketTitle,
  collateralSymbol,
  amount,
  title,
  subtitle,
  imageUrl
}: {
  marketTitle: string;
  collateralSymbol: string;
  amount: string;
  title: string;
  subtitle: string;
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
      <TextWrapper>
        <div style={{ fontSize: 20, margin: 14, display: 'flex' }}>
          {title}
          {/* Approve {amount} {collateralSymbol}? */}
        </div>
        <div style={{ fontSize: 14, display: 'flex', lineHeight: 2 }}>
          {subtitle}
          {/* You are going to approve {amount} {collateralSymbol} for betting on
					the outcome below */}
        </div>
        <TextWrapper fontSize={14} containerPadding={0}>
          {marketTitle}
        </TextWrapper>
      </TextWrapper>
    </div>
  );
};
