/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    pageExtensions: ['page.tsx', 'page.ts'],
    reactStrictMode: true,
    output: 'standalone',
};

module.exports = nextConfig;
