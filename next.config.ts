import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// In production, NEXT_PUBLIC_DOMAIN should hold: <yourproject>.vercel.app OR your custom domain.
// If it's missing, fallback to "*" so Next.js won't break during build.
const domain = isDev ? "localhost" : process.env.NEXT_PUBLIC_DOMAIN || "*";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local development support
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/all-leads/files/**",
      },

      // Production (Vercel or custom domain)
      {
        protocol: "https",
        hostname: domain,
        pathname: "/api/all-leads/files/**",
      },

      // Additional fallback (optional) — allows images from any HTTPS domain if needed
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
