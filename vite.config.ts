import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Grutto Walk',
                short_name: 'Grutto Walk',
                description:
                    '歩きたい距離を選ぶだけ。今いる場所から戻ってこられる散歩コースをご案内します。',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#ffffff',

                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                screenshots: [
                    {
                        src: '/screenshots/grutto-walk-mobile.png',
                        sizes: '390x840',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Grutto Walkのスマートフォン画面'
                    },
                    {
                        src: '/screenshots/grutto-walk-desktop.png',
                        sizes: '1280x720',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Grutto Walkのデスクトップ画面'
                    }
                ]
            }
        })
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
