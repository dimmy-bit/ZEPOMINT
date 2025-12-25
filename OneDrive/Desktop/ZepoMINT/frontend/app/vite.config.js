import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      exclude: [
        'fs', // Excludes the polyfill for `fs` and `node:fs`.
      ],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  assetsInclude: ['**/*.wasm'],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Add WebAssembly support
    assetsInlineLimit: 0, // Prevent inlining of WebAssembly files
  },
  resolve: {
    alias: {
      '@': '/src'
    },
    // Only resolve modules from the current directory's node_modules
    modules: ['node_modules']
  },
  optimizeDeps: {
    include: ['@zama-fhe/relayer-sdk/web'],
    // Exclude WebAssembly modules from optimization
    exclude: ['@zama-fhe/relayer-sdk']
  },
  worker: {
    format: 'es',
    plugins: () => [
      nodePolyfills({
        // To exclude specific polyfills, add them to this list.
        exclude: [
          'fs', // Excludes the polyfill for `fs` and `node:fs`.
        ],
        // Whether to polyfill specific globals.
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          global: true,
          process: true,
        },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ]
  },
  // Prevent Vite from trying to bundle problematic dependencies
  ssr: {
    noExternal: ['@zama-fhe/relayer-sdk']
  },
  // Add server configuration for better WebAssembly handling and CORS
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    // Add proxy for IPFS gateways to avoid CORS issues
    proxy: {
      '/ipfs-proxy': {
        target: 'https://gateway.pinata.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ipfs-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyRes', function (proxyRes, req, res) {
            // Add CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          });
        }
      }
    }
  }
})