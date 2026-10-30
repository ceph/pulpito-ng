import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'

const config = {
  title: 'Pulpito',
  ssr: true,
  extends: [vikeReact],
  redirects: {
    "/": "/runs",
  },
} satisfies Config

export default config
