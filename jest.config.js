module.exports = {
    clearMocks: true,
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test/singleton.js'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/prisma/',
        '/src/routes/',
        '/src/controllers/postWorker',
        '/src/controllers/notifications',
        '/src/controllers/statistics',
        '/src/services/notifications',
        '/src/services/statistics',
        '/src/database/notifications',
    ],
}
