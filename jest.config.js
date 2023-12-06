module.exports = {
    clearMocks: true,
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test/singleton.js'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/prisma/',
        '/src/routes/',
    ],
}
