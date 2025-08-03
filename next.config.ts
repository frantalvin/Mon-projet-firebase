import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Temporarily removed
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Temporarily removed
  // },
  experimental: {
    allowedDevOrigins: ["https://6000-firebase-studio-1748394838202.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev"],
  },
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
  reactStrictMode: true, // Ensures React Strict Mode is enabled
};

export default nextConfig;
