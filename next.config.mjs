/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    },
  },
};

export default nextConfig;
