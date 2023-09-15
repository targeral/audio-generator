const { defineConfig } = require('./dist/config');

const commonConfig = {
    baseUrl: 'https://www.bilibili.com',
    videoPath: '/video/BV173411x7sF',
    duration: '2',
};

module.exports = defineConfig([
    {
        ...commonConfig,
        startTime: '39',
        part: 2,
    },
    {
        ...commonConfig,
        startTime: '20',
        part: 3,
    },
    {
        ...commonConfig,
        startTime: '1:21',
        part: 4,
    }
]);
