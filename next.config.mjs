/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, ''), 'your-r2-bucket.cloudflarestorage.com'].filter(Boolean),
  },
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    }
    return config
  },
  experimental: {
    esmExternals: true,
  },
}

export default nextConfig
