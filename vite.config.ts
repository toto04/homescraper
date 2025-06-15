import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import path from "node:path"

const clientFolder = path.resolve(import.meta.dirname, "./src/client")

// https://vitejs.dev/config/
export default defineConfig({
  root: clientFolder,
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "../../dist/client",
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": clientFolder,
      "/src/main.tsx": path.resolve(clientFolder, "main.tsx"),
    },
  },
})
