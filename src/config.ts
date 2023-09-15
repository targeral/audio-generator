export interface Config {
    name?: string;
    baseUrl: string;
    videoPath: string;
    part: number;
    url?: string;
    startTime: string;
    endTime?: string;
    duration?: string;
}

export const defineConfig = (configs: Config[]) => configs;