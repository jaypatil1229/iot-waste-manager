/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false, // Explicitly exclude Node.js `dns` module
      };
      return config;
    },
    // strictModel: false,
  };
  
  export default nextConfig;
  