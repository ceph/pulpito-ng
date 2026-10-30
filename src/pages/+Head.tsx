import { ColorSchemeScript } from '@mantine/core';

import { runtimeConfigScript } from '#src/lib/config';

export default function Head() {
  return (
    <>
      {/* Set the color scheme before first paint to avoid a light-mode flash */}
      <ColorSchemeScript defaultColorScheme="auto" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: serialized server config */}
      <script dangerouslySetInnerHTML={{ __html: runtimeConfigScript() }} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="description" content="Pulpito" />
    </>
  );
}
