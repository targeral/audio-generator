import { join } from 'path';
import { type Config } from './config';
import { fs, logger, json5 } from '@modern-js/utils';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import jsdom from 'jsdom';

interface AudioInfo { url: string, filePath: string };

const configPath = 'audio.config.js';

const readConfig = (cwd: string): Config[] => {
    const absPath = join(cwd, configPath);
    return require(absPath);
};

const getPlayInfo = (content: string) => {
    // console.info(content);
    const playInfo = content.match(
        new RegExp('<script>window.__playinfo__=(.*?)</script>')
    );
    if (playInfo) {
        return json5.parse(playInfo[1]);
    }

    throw new Error('没有找到 __playinfo__');
};

const getSomeData = (content: string) => {
    const initState = content.match(
        new RegExp('<script>window.__INITIAL_STATE__=(.*?)</script>', 'gm')
    );

    if (initState) {
        // console.info(initState[0])
        const { window } = new jsdom.JSDOM(initState[0], { runScripts: 'dangerously' });
        // console.info(window.__INITIAL_STATE__);
        return window.__INITIAL_STATE__;
        // return json5.parse(initState[1]);
    }

    throw new Error('没有找到 __INITIAL_STATE__');
}

const getTitle = (html: string, part: number) => {
    const initState = getSomeData(html);
    return initState['videoData']['pages'][part - 1]['part'];
};

const getAudioInfo = (playInfo: any, title: string, userConfig: Config): AudioInfo => {
    return { url: playInfo['data']['dash']['audio'][0]['base_url'], filePath: join(process.cwd(), `${userConfig.name ?? title}.mp3`) };
}

const cwd = process.cwd();
const userConfigs = readConfig(cwd);
// logger.info('userConfig', userConfigs);

const client = axios.create({
    // baseURL: userConfig.baseUrl,
    baseURL: 'https://www.bilibili.com',
    timeout: 1000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
        "referer": "https://www.bilibili.com"
    }
});

const downAudioFile = async (options: AudioInfo): Promise<{success: boolean; tempPath: string}> => {
    console.info('/video/BV173411x7sF?p=2', options.url )
    const resp = await client.get(
        options.url, 
        // '/video/BV173411x7sF?p=2',
    {
        responseType: 'stream'
    });
    console.info(resp.status);
    // console.info('resp.request.url', resp.request)
    const tempPath = join(process.cwd(), 'temp.mp4');
    const writer = fs.createWriteStream(tempPath);
    console.log(`开始下载`);
    resp.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", () => {
            resolve({ success: true, tempPath });
        });
        writer.on("error", () => reject({ error: true }));
    });
    // const chunkSize = 1024;
    // const fileSize = Number(resp.headers['Content-Length']);
    // let downloadSize = 0;
    // const fileSizeMB = fileSize / 1024 / 1024;
    // logger.info(`文件大小：${fileSize.toFixed(1)} MB`);
    // const startTime = new Date();
    // resp.data.pipe()
}


const runTask = async (userConfig: Config) => {
    const resp = await client.get(`${userConfig.videoPath}${userConfig.part ? `?p=${userConfig.part}` : ''}`);
    console.info(resp.request.path)
    const playInfo = getPlayInfo(resp.data);
    const title = getTitle(resp.data, userConfig.part);
    console.info('title', title);
    const audioInfo = getAudioInfo(playInfo, title, userConfig);
    console.info(audioInfo)
    const ret = await downAudioFile(audioInfo);
    if (ret.success) {
        ffmpeg(ret.tempPath)
            .audioFrequency(48000)
            .audioBitrate(32)
            .setStartTime(userConfig.startTime)
            // TODO: support endTime - startTime
            .setDuration(userConfig.duration ?? 10)
            .audioCodec('libmp3lame')
            .format('mp3')
            // .audioCodec('pcm_s16le')
            .save(audioInfo.filePath + '.wav')
            .on('end', () => {
                console.log('Conversion finished');
            })
            .on('error', (err) => {
                console.log('An error occurred: ' + err.message);
            });
    }
}

const main = async () => {
    for (const config of userConfigs) {
        await runTask(config);
    }
}

main();