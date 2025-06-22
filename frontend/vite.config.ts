import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "src"),
		},
	},
	server: {
		port: 8000,
		proxy: {
			"/api": {
				target: "http://localhost:80",
				changeOrigin: true,
			},
			"/manage": {
				target: "http://localhost:5000",
				changeOrigin: true,
			},
			"/auth": {
				target: "http://localhost:5000",
				changeOrigin: true,
			},
			"/ai": {
				target: "http://localhost:5018",
				changeOrigin: true,
			},
		},
	},
});
