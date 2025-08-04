/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // Ajout de cette ligne pour corriger l'avertissement de Cross Origin lors du développement.
        // Cela peut être nécessaire dans les futures versions de Next.js.
        allowedDevOrigins: ["https://*.cloudworkstations.dev"],
    }
};

export default nextConfig;
