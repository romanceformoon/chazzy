/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/comm-api/:path*',
        destination: `https://comm-api.game.naver.com/:path*`,
      },
      {
        source: '/n-api/:path*',
        destination: `https://api.chzzk.naver.com/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
