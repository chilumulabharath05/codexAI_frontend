/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://codexai-backend-dp0f.onrender.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
