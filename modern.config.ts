import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
    plugins: [moduleTools()],
    buildConfig: {
        // dts: false,
        buildType: 'bundleless',
    }
});