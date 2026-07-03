import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// CR-20260703-003: @tailwindcss/vite removed due to native binding incompatibility
export default defineConfig({
  plugins: [vue()],
  base: './',
})
