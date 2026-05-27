import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { UserConfig } from 'vite'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))


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
    "rich-textarea",
  );
}

export default {
  plugins: [
    react(),
    vike(),
  ],
  resolve: {
    alias: {
      "#src": `${__dirname}/src`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
              return 'vendor-mui';
            }
            if (id.includes('@mantine/core') || id.includes('@mantine/hooks') || id.includes('@mantine/dates')) {
              return 'vendor-mantine';
            }
            if (id.includes('@tanstack/react-table')) {
              return 'vendor-table';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  ssr: {noExternal},
} satisfies UserConfig
