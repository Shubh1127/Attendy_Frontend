/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable build-time Google Fonts fetching so the project builds in
  // sandboxed / air-gapped environments. Remove in production (with network
  // access) to let next/font self-host the fonts automatically.
  optimizeFonts: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
