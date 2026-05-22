import type { OpenNextConfig } from '@opennextjs/cloudflare';

const config: OpenNextConfig = {
  default: {
    runtime: 'cloudflare-module',
    regions: [],
  },
  middleware: {
    runtime: 'cloudflare-module',
    regions: [],
  },
  options: {
    minify: true,
    /**
     * @description
     * Cloudflare environment (production, staging, etc)
     * Defaults to "production"
     */
    envId: 'production',
    /**
     * @description
     * Cloudflare account ID
     * Required
     */
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    /**
     * @description
     * Cloudflare API token
     * Required
     */
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  },
};

export default config;
