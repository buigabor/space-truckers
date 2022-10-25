import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(({ command, mode }) => {
    return {
        resolve: {
            alias: {
                find: "@",
                replacement: path.resolve(__dirname, "src"),
            },
        },
    };
});
