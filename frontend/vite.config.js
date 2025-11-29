import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // penting untuk ngrok
    allowedHosts: ['dcd405eab62a.ngrok-free.app'], // tambahkan host ngrok kamu
  }
})
