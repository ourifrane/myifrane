import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dwrfhf4oh/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
