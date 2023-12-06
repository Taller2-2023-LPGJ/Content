const { mockDeep, mockReset } = require('jest-mock-extended');

const prisma = require('../src/database/client');
const axios = require('axios');

const prismaMock = prisma;
const axiosMock = axios;

jest.mock('../src/database/client', () => mockDeep());
jest.mock('axios', () => mockDeep());

beforeEach(() => {
  	mockReset(prismaMock);
  	mockReset(axiosMock);
})

module.exports = {prismaMock, axiosMock};
