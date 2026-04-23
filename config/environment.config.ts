import 'dotenv/config';

export interface Credentials {
  username: string;
  password: string;
}

export interface EnvironmentConfig {
  name: string;
  webBaseUrl: string;
  apiBaseUrl: string;
  uiCredentials: Credentials;
  apiToken: string;
  timeout: number;
  retries: number;
}

type EnvKey = 'qa' | 'stage' | 'prod';

type BaseEnv = Omit<EnvironmentConfig, 'uiCredentials' | 'apiToken'>;

const environments: Record<EnvKey, BaseEnv> = {
  qa: {
    name: 'qa',
    webBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://reqres.in/api',
    timeout: 30_000,
    retries: 1,
  },
  stage: {
    name: 'stage',
    webBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://reqres.in/api',
    timeout: 30_000,
    retries: 2,
  },
  prod: {
    name: 'prod',
    webBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://reqres.in/api',
    timeout: 30_000,
    retries: 2,
  },
};

function resolveEnvKey(): EnvKey {
  const raw = (process.env.TEST_ENV || 'qa').toLowerCase();
  if (raw === 'qa' || raw === 'stage' || raw === 'prod') return raw;
  throw new Error(
    `Invalid TEST_ENV "${raw}". Expected one of: ${Object.keys(environments).join(', ')}`,
  );
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const key = resolveEnvKey();
  const base = environments[key];

  const username = process.env.UI_USERNAME ?? 'standard_user';
  const password = process.env.UI_PASSWORD ?? 'secret_sauce';
  const apiToken = process.env.API_TOKEN ?? 'reqres-free-v1';

  return {
    ...base,
    uiCredentials: { username, password },
    apiToken,
  };
}
