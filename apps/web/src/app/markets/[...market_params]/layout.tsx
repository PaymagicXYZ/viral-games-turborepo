import { getFrameMetadata } from 'frog/next';
import type { Metadata } from 'next';

type Props = {
  params: {
    market_params: [string, string];
  };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const [provider, identifier] = params.market_params;

    const frameMetadata = await getFrameMetadata(
      `${process.env.NEXT_PUBLIC_WEB_APP_BASE_URL}/markets/frames/initial/${provider}/${identifier}`,
    );

    console.log('frameMetadata', frameMetadata);

    return {
      // title: market?.proxyTitle ?? market?.title ?? 'Noname market',
      // openGraph: {
      //   title: market?.proxyTitle ?? market?.title ?? 'Noname market',
      //   description: market?.description,
      //   images: [`${market?.ogImageURI}`],
      // },
      //@ts-ignore
      other: frameMetadata,
    };
  } catch (error) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    console.error(`Error fetching market`, error);

    return {};
  }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>;
};

export default Layout;
