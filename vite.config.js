import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  return {
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
      ],
    },
    assetsInclude: '**/*.m4a',
  };
});
