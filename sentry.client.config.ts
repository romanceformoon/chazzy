// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://d672d87c951628d852199948e3e21424@o4506489365594112.ingest.sentry.io/4506489367298048',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    new Sentry.Replay({
      networkDetailAllowUrls: [
        /https:\/\/api.chzzk.naver.com.proxy.aioo.ooo\/polling\/v2\/channels\/[0-9a-f]{32}\/live-status/,
        'https://api.twitch.tv/helix/streams',
        'https://comm-api.game.naver.com.proxy.aioo.ooo/nng_main/v1/chats/access-token',
      ],
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
