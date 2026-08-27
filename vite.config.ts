import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  /// <reference types="vitest" />
  test: {
    globals: true,
    environment: 'node',
  },
  plugins: [
    react(),
    dts({
      include: ['src/lib'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'SdkMoMenuReact',
      fileName: (format: string) =>
        format === 'es' ? 'sdk-momenu-react.js' : 'sdk-momenu-react.umd.cjs',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
} as any)
