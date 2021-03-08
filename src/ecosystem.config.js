module.exports = {
    apps: [
        {
            env: {
                NODE_ENV: 'development',
                PORT: 9000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 9000,
            },
            exec_mode: 'cluster',
            instances: 4,
            max_restarts: 5,
            name: 'api',
            script: './build/index.js',
            watch: true,
        },
    ],
};
