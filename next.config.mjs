/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "firebase/app":       "firebase/app",
        "firebase/auth":      "firebase/auth",
        "firebase/firestore": "firebase/firestore",
      },
    },
  },
  reactCompiler: true
};