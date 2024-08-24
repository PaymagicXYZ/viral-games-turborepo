import { PropsWithChildren } from 'react';
import PrivyProvider from './PrivyProvider';

export default function Providers({ children }: PropsWithChildren) {
  return <PrivyProvider>{children}</PrivyProvider>;
}
