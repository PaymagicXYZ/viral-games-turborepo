import { PropsWithChildren } from 'react';
import PrivyProvider from './PrivyProvider';
import ReactQueryProvider from './ReactQueryProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <PrivyProvider>{children}</PrivyProvider>
    </ReactQueryProvider>
  );
}
