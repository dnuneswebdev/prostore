import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{protocol: "https", hostname: "utfs.io", port: ""}], //isso só foi adicionado para o next/image funcionar com imagens de sites externos que no caso é o uploadthings
  },
};

export default nextConfig;
