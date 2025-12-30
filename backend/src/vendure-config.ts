import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSchedulerPlugin,
  DefaultSearchPlugin,
  VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import 'dotenv/config';
import path from 'path';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;

export const config: VendureConfig = {
  apiOptions: {
    hostname: '0.0.0.0',
    port: serverPort,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // Enable trust proxy for Railway (handles X-Forwarded-For headers)
    trustProxy: true,
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
      ? {
          adminApiDebug: true,
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier:
        process.env.SUPERADMIN_USERNAME ||
        (() => {
          console.error('[Config Error] SUPERADMIN_USERNAME is required but not set!');
          process.exit(1);
          return '';
        })(),
      password:
        process.env.SUPERADMIN_PASSWORD ||
        (() => {
          console.error('[Config Error] SUPERADMIN_PASSWORD is required but not set!');
          process.exit(1);
          return '';
        })(),
    },
    cookieOptions: {
      secret:
        process.env.COOKIE_SECRET ||
        (() => {
          console.error('[Config Error] COOKIE_SECRET is required but not set!');
          console.error('[Config Error] Generate one with: openssl rand -base64 32');
          process.exit(1);
          return '';
        })(),
    },
  },
  dbConnectionOptions: (() => {
    // Support Railway's DATABASE_URL format or individual env vars
    if (process.env.DATABASE_URL) {
      console.log('[DB Config] Using DATABASE_URL for connection');
      return {
        type: 'postgres' as const,
        synchronize: process.env.APP_ENV === 'dev' ? true : false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        url: process.env.DATABASE_URL,
        schema: process.env.DB_SCHEMA || 'public',
      };
    } else {
      console.log('[DB Config] DATABASE_URL not found, using individual env vars');
      console.log('[DB Config] DB_HOST:', process.env.DB_HOST || 'NOT SET');
      console.log('[DB Config] DB_PORT:', process.env.DB_PORT || 'NOT SET');
      console.log('[DB Config] DB_NAME:', process.env.DB_NAME || 'NOT SET');
      // Fall back to individual environment variables
      return {
        type: 'postgres' as const,
        synchronize: process.env.APP_ENV === 'dev' ? true : false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA || 'public',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      };
    }
  })(),
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},
  plugins: [
    GraphiqlPlugin.init(),
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: process.env.ASSET_UPLOAD_DIR || path.join(__dirname, '../static/assets'),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : 'https://admin.shortfusemusic.com/assets/',
    }),
    DefaultSchedulerPlugin.init(),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(
        path.join(__dirname, '../static/email/templates')
      ),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        fromAddress:
          process.env.FROM_EMAIL_ADDRESS || '"Short Fuse Music" <noreply@shortfusemusic.com>',
        verifyEmailAddressUrl: IS_DEV
          ? 'http://localhost:3001/verify'
          : 'https://shop.shortfusemusic.com/verify',
        passwordResetUrl: IS_DEV
          ? 'http://localhost:3001/password-reset'
          : 'https://shop.shortfusemusic.com/password-reset',
        changeEmailAddressUrl: IS_DEV
          ? 'http://localhost:3001/verify-email-address-change'
          : 'https://shop.shortfusemusic.com/verify-email-address-change',
      },
    }),
    AdminUiPlugin.init({
      route: 'admin',
      port: serverPort + 2,
      adminUiConfig: {
        // Explicitly set API URL for production
        apiHost: IS_DEV ? 'http://localhost' : 'https://admin.shortfusemusic.com',
        apiPort: IS_DEV ? serverPort : 443,
      },
    }),
  ],
};
