import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // ============================================
    // OPTIMIZACIONES DE BUILD
    // ============================================
    build: {
        // Tamaño máximo antes de chunk
        chunkSizeWarningLimit: 500,
        // Code splitting automático
        rollupOptions: {
            output: {
                // Manual chunks para mejor cache (sin firebase que causa problemas)
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router'],
                    'vendor-ui': ['lucide-react'],
                },
                // Nombres de chunks con hash
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (ext === 'css') {
                        return 'assets/css/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
        // Minificación
        minify: 'esbuild',
        // Generar sourcemap para producción
        sourcemap: false,
        // CSS code splitting
        cssCodeSplit: true,
    },
    // Optimizaciones de servidor dev
    server: {
        port: 5173,
        host: true,
    },
    // Optimizaciones de preview
    preview: {
        port: 4173,
        host: true,
    },
});
