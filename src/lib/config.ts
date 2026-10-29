// Settings that the browser needs and that are only known at runtime (the
// production bundle is built before deployment-specific env vars exist).
// The server reads them from its environment; +Head.tsx serializes them into
// the page, where the browser picks them up.
export type RuntimeConfig = {
  teuthologyApi: string;
  machineTypes: string[];
};

declare global {
  interface Window {
    __PULPITO_CONFIG__?: RuntimeConfig;
  }
}

function fromEnv(env: Record<string, string | undefined>): RuntimeConfig {
  return {
    teuthologyApi: env.VITE_TEUTHOLOGY_API || "",
    machineTypes: (env.VITE_MACHINE_TYPE || "smithi,mira").split(","),
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  if ( typeof window === "undefined" ) return fromEnv({ ...import.meta.env, ...process.env });
  return window.__PULPITO_CONFIG__ || fromEnv(import.meta.env);
}

export function runtimeConfigScript(): string {
  const json = JSON.stringify(getRuntimeConfig()).replace(/</g, "\\u003c");
  return `window.__PULPITO_CONFIG__=${json};`;
}
