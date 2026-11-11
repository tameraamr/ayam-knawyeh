import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App links: iOS reads this file to let shared /article/* links open the app.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
