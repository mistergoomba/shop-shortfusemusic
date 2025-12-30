import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

console.log('[Server] Starting migrations...');
runMigrations(config)
    .then(() => {
        console.log('[Server] Migrations completed, bootstrapping server...');
        return bootstrap(config);
    })
    .then(app => {
        // Add root redirect to /admin using NestJS HTTP adapter
        const httpAdapter = app.getHttpAdapter();
        httpAdapter.get('/', (req: any, res: any) => {
            res.redirect('/admin');
        });
        
        console.log('[Server] Vendure server is ready!');
        console.log(`[Server] Admin API: http://0.0.0.0:${process.env.PORT || 3000}/admin-api`);
        console.log(`[Server] Shop API: http://0.0.0.0:${process.env.PORT || 3000}/shop-api`);
        console.log(`[Server] Admin UI: http://0.0.0.0:${process.env.PORT || 3000}/admin`);
    })
    .catch(err => {
        console.error('[Server] Fatal error during startup:', err);
        process.exit(1);
    });
