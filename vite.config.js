import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/", import.meta.url)),
      "@icons": fileURLToPath(new URL("./src/assets/icons/", import.meta.url)),
      "@img": fileURLToPath(new URL("./src/assets/img/", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles/", import.meta.url)),
      "@video": fileURLToPath(new URL("./src/assets/video/", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components/", import.meta.url),
      ),
      "@features": fileURLToPath(new URL("./src/features/", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages/", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks/", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils/", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services/", import.meta.url)),
      "@contexts": fileURLToPath(new URL("./src/contexts/", import.meta.url)),
      "@routes": fileURLToPath(new URL("./src/routes/", import.meta.url)),
      "@ui": fileURLToPath(new URL("./src/components/ui/", import.meta.url)),
      "@dashboard": fileURLToPath(
        new URL("./src/components/features/dashboard/", import.meta.url),
      ),
      "@templates": fileURLToPath(
        new URL("./src/components/features/templates/", import.meta.url),
      ),
      "@scenarios": fileURLToPath(
        new URL("./src/components/features/scenarios/", import.meta.url),
      ),
      "@videos": fileURLToPath(
        new URL("./src/components/features/videos/", import.meta.url),
      ),
      "@auth": fileURLToPath(
        new URL("./src/components/features/auth/", import.meta.url),
      ),
      "@others": fileURLToPath(
        new URL("./src/components/features/others/", import.meta.url),
      ),
    },
  },
});
