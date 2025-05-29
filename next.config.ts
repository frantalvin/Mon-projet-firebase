import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Temporarily removed
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Temporarily removed
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true, // Explicitly set
};

export default nextConfig;
