import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import {
  CHAIN_NAMESPACES,
  WEB3AUTH_NETWORK,
  WALLET_ADAPTERS,
  CustomChainConfig,
} from '@web3auth/base';
import { Chain } from 'wagmi/chains';
import { WalletServicesPlugin } from '@web3auth/wallet-services-plugin';
import { getDefaultExternalAdapters } from '@web3auth/default-evm-adapter';

const CLIENT_ID =
  'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ';

export default function Web3AuthConnectorInstance(chains: Chain[]) {
  const chainConfig: CustomChainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x' + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0],
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorerUrl: chains[0].blockExplorers?.default.url[0] as string,
    logo: 'https://web3auth.io/images/web3authlog.png',
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const web3AuthOptions: Web3AuthOptions = {
    clientId: CLIENT_ID,
    chainConfig,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
    uiConfig: {
      appName: 'Viral.games',
      appUrl: 'https://viral.games',
    },
  };

  const web3AuthInstance = new Web3Auth(web3AuthOptions);

  const walletServicesPlugin = new WalletServicesPlugin({
    wsEmbedOpts: {},
    walletInitOptions: {
      whiteLabel: {
        showWidgetButton: true,
        buttonPosition: 'bottom-right',
        mode: 'dark',
      },
    },
  });
  web3AuthInstance.addPlugin(walletServicesPlugin);

  // Initialize external adapters
  getDefaultExternalAdapters({ options: web3AuthOptions })
    .then((adapters) => {
      adapters.forEach((adapter) => {
        web3AuthInstance.configureAdapter(adapter);
      });
    })
    .catch((error) => {
      console.error('Failed to initialize external adapters:', error);
    });

  const modalConfig = {
    [WALLET_ADAPTERS.OPENLOGIN]: {
      label: 'openlogin',
      showOnModal: true,
    },
  };

  return Web3AuthConnector({
    web3AuthInstance,
    modalConfig,
    loginParams: {
      loginProvider: 'google',
    },
  });
}