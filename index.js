/**
 * import requests
import re
import json 

url = 'https://www.bilibili.com/video/BV1BU4y1H7E3'

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
    "referer": "https://www.bilibili.com"
    }

resp = requests.get(url, headers=headers)

palyinfo = re.findall(r'<script>window.__playinfo__=(.*?)</script>', resp.text)[0]

palyinfo_data = json.loads(palyinfo)
 */
const path = require('path');
const { fs, logger } = require('@modern-js/utils');
const axios = require('axios');

const configPath = 'audio.config.js';

const readConfig = (cwd) => {
    const absPath = path.join(cwd, configPath);
    return require(absPath);
};

const cwd = process.cwd();
const userConfig = readConfig(cwd);

logger.info('userConfig', userConfig);

const client = axios.create({
    baseURL: 'https://some-domain.com/api/',
    timeout: 1000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
        "referer": "https://www.bilibili.com"
    }
});
client.get();
// axios({
//     method: 'GET',
//     url: userConfig.url,
// })

