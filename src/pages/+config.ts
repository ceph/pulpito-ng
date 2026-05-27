import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'

const config = {
  title: 'pulpito-ng',
  ssr: true,
  extends: [vikeReact],
  passToClient: ['pageProps', 'user'],
  redirects: {
    "/": "/runs",
  },
} satisfies Config

export default config
