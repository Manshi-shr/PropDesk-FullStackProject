import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.routes.js';
import { openApiSpec } from './server/swagger.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory for documents & images
  const uploadDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Static public directory for reports & assets
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // Direct download endpoint for project report
  app.get('/api/download-report', (req, res) => {
    const filePath = path.join(publicDir, 'PropDesk_Project_Report.pdf');
    res.download(filePath, 'PropDesk_Project_Report.pdf', (err) => {
      if (err) {
        res.status(404).json({ error: 'Report file not found' });
      }
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PropDesk Management API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // OpenAPI / Swagger JSON spec
  app.get('/api/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // API v1 Routes
  app.use('/api/v1', apiRouter);

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PropDesk] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PropDesk] Failed to start server:', err);
  process.exit(1);
});
