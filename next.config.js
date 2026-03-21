/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Redirect HTTP → HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://' + (process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') ?? 'localhost') + '/:path*',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

