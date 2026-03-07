import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        legacy({
            // Compatibilidad crítica con Android 4.4.4 y navegador genérico
            targets: ['chrome >= 30', 'android >= 4.4'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        })
    ],
    build: {
        target: 'es2015', // Vite genera el fallback a es5 a traves del plugin, dejando el modern target en 2015.
        cssTarget: 'chrome30', // Asegura no generar var() ni cosas no soportadas por CSS
        rollupOptions: {
            input: {
                admin: 'index.html',
                tv: 'tv.html'
            }
        }
    }
}
);
