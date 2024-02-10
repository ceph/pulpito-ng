export { config }

import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'
import vikeReactQuery from 'vike-react-query/config'

const config = {
  title: 'pulpito-ng',
  ssr: true,
  extends: [vikeReact,vikeReactQuery],
  passToClient: ['pageProps'],
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
  },
} satisfies Config
