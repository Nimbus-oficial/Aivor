/** @type {import("next").NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@orvex/ui", "@orvex/types", "@orvex/sdk"]
};

export default nextConfig;
