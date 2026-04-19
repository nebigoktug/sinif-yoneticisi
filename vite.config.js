import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function swVersionPlugin() {
  const version = Date.now().toString();
  return {
    name: 'sw-version',
    // Dev sunucusunda sw.js'e timestamp enjekte et
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sw.js') {
          const swPath = path.resolve('public/sw.js');
          const content = fs.readFileSync(swPath, 'utf-8').replace('__CACHE_VERSION__', version);
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
          res.end(content);
          return;
        }
        next();
      });
    },
    // Production build'de dist/sw.js'e timestamp yaz
    closeBundle() {
      const swPath = path.resolve('dist/sw.js');
      if (fs.existsSync(swPath)) {
        const content = fs.readFileSync(swPath, 'utf-8').replace('__CACHE_VERSION__', version);
        fs.writeFileSync(swPath, content);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
})
