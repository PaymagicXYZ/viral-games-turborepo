/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { TextWrapper } from './TextWrapper';

export const InitialScreen = ({
  marketTitle,
  collateralSymbol,
}: {
  marketTitle: string;
  collateralSymbol: string;
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
        src={'/frames/default.png'}
        width={'100%'}
        alt='Confirm Country'
        style={{
          position: 'absolute',
        }}
      />
      <TextWrapper>{marketTitle}</TextWrapper>
    </div>
  );
};