import type { NextConfig } from "next";
import os from "os";

// Next.js Server Actions only accept requests whose Origin header matches an
// allowed host. In dev, that's normally just localhost — which blocks the
// login/complaint forms when the app is opened from a phone via the
// machine's LAN IP (e.g. http://192.168.1.5:3000). We collect every local
// network IPv4 address here so Server Actions work from other devices on
// the same network during the demo.
function getLanIps(): string[] {
  const ips: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const lanIps = getLanIps();

const nextConfig: NextConfig = {
  // Allows the dev server's HMR/static-chunk requests when the app is
  // opened from another device (e.g. a phone) via this machine's LAN IP.
  // This block only affects `next dev`; it has no effect in production.
  allowedDevOrigins: [...lanIps],
  experimental: {
    serverActions: {
      // Allows Server Action form submissions (login, complaints, etc.)
      // from the same LAN-IP origins during local dev.
      allowedOrigins: [...lanIps.map((ip) => `${ip}:3000`)],
    },
  },
};

export default nextConfig;
