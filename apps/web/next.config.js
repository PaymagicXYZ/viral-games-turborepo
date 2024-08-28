/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'bufferutil',
      'utf-8-validate',
    );
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // posthog reverse proxy
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path(.*)',
        destination: 'https://us-assets.i.posthog.com/static/:path',
      },
      {
        source: '/ingest/:path(.*)',
        destination: 'https://us.i.posthog.com/:path',
      },
    ];
  },
};

module.exports = nextConfig;
