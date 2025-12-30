import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';
import { Request, Response, NextFunction } from 'express';

console.log('[Server] Starting migrations...');
runMigrations(config)
    .then(() => {
        console.log('[Server] Migrations completed, bootstrapping server...');
        return bootstrap(config);
    })
    .then(app => {
        // Add root redirect middleware - must be registered early
        const httpAdapter = app.getHttpAdapter();
        const expressApp = httpAdapter.getInstance();
        
        // Use use() to register middleware that runs before other routes
        expressApp.use((req: Request, res: Response, next: NextFunction) => {
            if (req.path === '/' && req.method === 'GET') {
                return res.redirect(301, '/admin');
            }
            next();
        });
        
        console.log('[Server] Root redirect middleware configured: / -> /admin');
        console.log('[Server] Vendure server is ready!');
        console.log(`[Server] Admin API: http://0.0.0.0:${process.env.PORT || 3000}/admin-api`);
        console.log(`[Server] Shop API: http://0.0.0.0:${process.env.PORT || 3000}/shop-api`);
        console.log(`[Server] Admin UI: http://0.0.0.0:${process.env.PORT || 3000}/admin`);
    })
    .catch(err => {
        console.error('[Server] Fatal error during startup:', err);
        process.exit(1);
    });
