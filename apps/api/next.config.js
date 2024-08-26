/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CG_API_KEY: process.env.CG_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    NODEJS_HELPERS: process.env.NODEJS_HELPERS,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    TOKEN: process.env.TOKEN,
  },
};

module.exports = nextConfig;
