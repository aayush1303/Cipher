import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    dest: 'public', // Service worker and PWA assets will be generated here
    disable: process.env.NODE_ENV === 'development', // Disable PWA during development
})({
    async redirects() {
        return [
            {
                source: '/',
                destination: '/conversations',
                permanent: true,
            },
        ];
    },
});

export default nextConfig;