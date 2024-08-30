/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { TextWrapper } from './TextWrapper';

export const SuccessScreen = ({
  collateralSymbol,
  amount,
  imageUrl
}: {
  collateralSymbol: string;
  amount: string;
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
      <TextWrapper imageSrc='/frames/success_icon.png'>
        <div style={{ fontSize: 14, display: 'flex', lineHeight: 2 }}>
          Your bet of {amount} {collateralSymbol} has been placed successfully
        </div>
      </TextWrapper>
    </div>
  );
};
