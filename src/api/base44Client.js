import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

/**
 * Base44 client — works standalone and inside the Base44 editor preview iframe.
 * URL params (app_id, access_token, …) are picked up via app-params.
 * Matches the pattern used by Base44-generated apps (e.g. fitfam-connect).
 */
export const base44 = createClient({
  appId: appId || '6a8c70e20596effd80c14869',
  token: token || undefined,
  functionsVersion: functionsVersion || undefined,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl: appBaseUrl || undefined,
});
