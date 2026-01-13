import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      plugins: [
        tailwindcss(),
        react()
      ],
      server: {
        port: 8080,
        host: '0.0.0.0',
        proxy: {
          '/api/skillsmp': {
            target: 'https://skillsmp.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/api\/skillsmp/, '/api'),
            headers: {
                // Mimic a real browser request to bypass basic WAF
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache',
                // Removing manual Origin/Referer spoofing as changeOrigin: true handles Host mainly
                // and Cloudflare might flag mismatching Origin/Referers
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
