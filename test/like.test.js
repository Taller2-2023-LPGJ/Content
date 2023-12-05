const controller = require('../src/controllers/like');
const { prismaMock } = require('./singleton');
const express = require('express');
const app = express();

app.use(express.json());

let res = {
    statusVal: 500,
    jsonVal: {},
    status: jest.fn().mockImplementation((val) => {
        res = {...res, statusVal: val};
        return res;
    }),
    json: jest.fn().mockImplementation((val) => {
        res = {...res, jsonVal: val};
        return res;
    })
}

class PrismaError {
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
}

PrismaError.prototype = new Error();

describe('Like', () => {   
    test('Successfully', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.likes.create.mockResolvedValue();
    
        await controller.like({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully 1', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error(''));
    
        await controller.like({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.likes.create.mockRejectedValue(new Error(''));
    
        await controller.like({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Invalid ID', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.likes.create.mockResolvedValue();
    
        await controller.like({params: {id: '10abc'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Private', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 0}]);
        prismaMock.likes.create.mockResolvedValue();
    
        await controller.like({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Duplicate', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.likes.create.mockRejectedValue(new PrismaError('', 'P2002'));
    
        await controller.like({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('Unlike', () => {   
    test('Successfully', async () => {
        prismaMock.likes.delete.mockResolvedValue();
    
        await controller.unlike({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully', async () => {
        prismaMock.likes.delete.mockRejectedValue(new Error(''));
    
        await controller.unlike({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Invalid ID', async () => {
        prismaMock.likes.delete.mockResolvedValue();
    
        await controller.unlike({params: {id: '10abc'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Private', async () => {
        prismaMock.likes.delete.mockRejectedValue(new PrismaError('', 'P2025'));
    
        await controller.unlike({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });
});
