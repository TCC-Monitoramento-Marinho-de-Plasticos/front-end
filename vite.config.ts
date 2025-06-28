import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite acesso externo (IP da VM)
    port: 5173, // ou outro que você quiser
    strictPort: true,
    open: true, // abre no navegador automaticamente
  }
})
