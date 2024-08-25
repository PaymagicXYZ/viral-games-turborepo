import { MarketProvider } from './MarketProvider';
import { CustomProvider } from './providers/CustomProvider';
import { LimitlessProvider } from './providers/LimitlessProvider';
import { PolymarketProvider } from './providers/PolymarketProvider';

export class MarketProviderFactory {
  static getProvider(provider: string): MarketProvider {
    switch (provider.toLowerCase()) {
      case 'polymarket':
        return new PolymarketProvider();
    //   case 'limitless':
    //     return new LimitlessProvider();
    //   case 'custom':
    //     return new CustomProvider();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
