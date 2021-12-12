/* eslint-env node */

import { chrome } from '../../electron-vendors.config.json'
import { join } from 'path'
import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'
import vuetify from '@vuetify/vite-plugin'
import vitePluginString from 'vite-plugin-string'
import pluginSvgVue from '@vuetter/vite-plugin-vue-svg'

const PACKAGE_ROOT = __dirname

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [
    vue(),
    pluginSvgVue(),
    vuetify({
      // autoImport: true,
      // styles: "expose",
    }),
    vitePluginString({
      /* Default */
      include: [
        '**/*.vs',
        '**/*.fs',
        '**/*.vert',
        '**/*.frag',
        '**/*.glsl',
        '**/*.txt',
      ],

      /* Default: undefined */
      exclude: 'node_modules/**',

      /* Default: true */
      // if true, using logic from rollup-plugin-glsl
      compress: false,
    }),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      external: [...builtinModules],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
}

export default config
