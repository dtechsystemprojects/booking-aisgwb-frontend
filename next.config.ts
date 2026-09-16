import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dtechsystem.co.in',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  // redirects: async () => {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/admin/dashboard',
  //       permanent: false,
  //     },
  //   ]
  // },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
      canvas: false,
    }
    return config
  },
}

export default nextConfig
