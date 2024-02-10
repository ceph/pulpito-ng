import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { UserConfig } from 'vite'


const noExternal = [
    "@mui/icons-material",
]
if (process.env.NODE_ENV == "production") {
  noExternal.push(
    "@mui/material",
    "@mui/utils",
    "@mui/base",
    "@mui/styled-engine",
    "@mui/system",
    "react-simple-code-editor",
  );
}

export default {
  plugins: [
    react(),
    vike({
      redirects: {
        "/": "/runs",
      },
    }),
  ],
  resolve: {
    alias: {
      "#src": `${__dirname}/src`,
    },
  },
  ssr: {noExternal},
} satisfies UserConfig
