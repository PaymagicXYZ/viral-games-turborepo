/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import type { ReactNode } from 'react';

export const TextWrapper = ({
  children,
  fontSize = 24,
  imageSrc,
  containerPadding = 40,
}: {
  children?: ReactNode;
  fontSize?: number;
  imageSrc?: string;
  containerPadding?: number;
}) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: containerPadding,
      }}
    >
      <div
        style={{
          width: '100%',
          padding: 20,
          fontSize,
          backgroundColor: 'white',
          maxHeight: '100%',
          color: 'black',
          border: '3px solid black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          lineHeight: 2,
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt='Confirm'
            width={100}
            height={100}
            style={{ width: 100, height: 100 }}
          />
        )}
        {children}
      </div>
    </div>
  );
};
