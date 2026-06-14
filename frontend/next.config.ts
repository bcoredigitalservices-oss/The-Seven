import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/public/sw.js",
          "**/public/sw.js.map",
          "**/public/workbox-*.js",
          "**/public/manifest.json",
        ],
      };
    }
    return config;
  },
};

const pwaWrapper = withPWA({
  dest: "public",
  disable: false,
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

export default pwaWrapper(nextConfig);

