import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Custom plugin to serve /quantum_asl_videos in development and copy it during build
const quantumAslVideosPlugin = () => {
  return {
    name: 'quantum-asl-videos-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Decode URL to parse spaces/characters cleanly
        const decodedUrl = decodeURIComponent(req.originalUrl || req.url || '');
        if (decodedUrl.startsWith('/quantum_asl_videos/')) {
          const relativePath = decodedUrl.replace(/^\/quantum_asl_videos\//, '');
          const filePath = path.resolve(process.cwd(), 'quantum_asl_videos', relativePath);
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.mp4') contentType = 'video/mp4';
            else if (ext === '.csv') contentType = 'text/csv';
            
            res.writeHead(200, {
              'Content-Type': contentType,
              'Cache-Control': 'no-cache',
            });
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      // Copy folder to dist/quantum_asl_videos for production deployment
      const srcDir = path.resolve(process.cwd(), 'quantum_asl_videos');
      const destDir = path.resolve(process.cwd(), 'dist/quantum_asl_videos');
      
      const copyDir = (src, dest) => {
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (let entry of entries) {
          const sPath = path.join(src, entry.name);
          const dPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(sPath, dPath);
          } else {
            fs.copyFileSync(sPath, dPath);
          }
        }
      };
      
      if (fs.existsSync(srcDir)) {
        console.log('Copying quantum_asl_videos to build output dist/');
        copyDir(srcDir, destDir);
      }
    }
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), quantumAslVideosPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
