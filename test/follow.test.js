const controller = require('../src/controllers/follow');
const { prismaMock, axiosMock } = require('./singleton');
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

describe('Follow', () => {   
    test('Successfully', async () => {
        prismaMock.follows.create.mockResolvedValue();
    
        await controller.follow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully', async () => {
        prismaMock.follows.create.mockRejectedValue(new Error(''));
    
        await controller.follow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Duplicate', async () => {
        prismaMock.follows.create.mockRejectedValue(new PrismaError('', 'P2002'));
    
        await controller.follow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Yourself', async () => {
        await controller.follow({params: {target: 'gstfrenkel'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('Unfollow', () => {   
    test('Successfully', async () => {
        prismaMock.follows.delete.mockResolvedValue();
    
        await controller.unfollow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully', async () => {
        prismaMock.follows.delete.mockRejectedValue(new Error(''));
    
        await controller.unfollow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Without following', async () => {
        prismaMock.follows.delete.mockRejectedValue(new PrismaError('', 'P2025'));
    
        await controller.unfollow({params: {target: 'pmartin'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Yourself', async () => {
        await controller.unfollow({params: {target: 'gstfrenkel'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('View Followers List', () => {   
    test('Successfully', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(true);
        prismaMock.follows.findMany.mockResolvedValue([{follower: 'lgrati'}, {follower: 'gstfrenkel'}]);
    
        await controller.viewFollowers({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual({followers: ['lgrati', 'gstfrenkel']});
    });

    test('Yourself', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(false);
        prismaMock.follows.findMany.mockResolvedValue([]);
    
        await controller.viewFollowers({params: {target: 'gstfrenkel'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual({followers: []});
    });

    test('Unsuccessfully', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockRejectedValue(new Error(''));
    
        await controller.viewFollowers({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(true);
        prismaMock.follows.findMany.mockRejectedValue(new Error(''));
    
        await controller.viewFollowers({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Without Following', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValueOnce(false);
        prismaMock.follows.findFirst.mockResolvedValueOnce(true);
        prismaMock.follows.findMany.mockResolvedValue([{follower: 'lgrati'}, {follower: 'gstfrenkel'}]);
    
        await controller.viewFollowers({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Without Being Followed', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValueOnce(true);
        prismaMock.follows.findFirst.mockResolvedValueOnce(false);
        prismaMock.follows.findMany.mockResolvedValue([{follower: 'lgrati'}, {follower: 'gstfrenkel'}]);
    
        await controller.viewFollowers({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('View Followed List', () => {   
    test('Successfully', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(true);
        prismaMock.follows.findMany.mockResolvedValue([{followed: 'lgrati'}, {followed: 'gstfrenkel'}]);
    
        await controller.viewFollowed({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual({followed: ['lgrati', 'gstfrenkel']});
    });

    test('Yourself', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(false);
        prismaMock.follows.findMany.mockResolvedValue([]);
    
        await controller.viewFollowed({params: {target: 'gstfrenkel'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual({followed: []});
    });

    test('Unsuccessfully', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockRejectedValue(new Error(''));
    
        await controller.viewFollowed({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValue(true);
        prismaMock.follows.findMany.mockRejectedValue(new Error(''));
    
        await controller.viewFollowed({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Without Following', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValueOnce(false);
        prismaMock.follows.findFirst.mockResolvedValueOnce(true);
        prismaMock.follows.findMany.mockResolvedValue([{followed: 'lgrati'}, {followed: 'gstfrenkel'}]);
    
        await controller.viewFollowed({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Without Being Followed', async () => {
        prismaMock.follows.create.mockResolvedValue();
        prismaMock.follows.findFirst.mockResolvedValueOnce(true);
        prismaMock.follows.findFirst.mockResolvedValueOnce(false);
        prismaMock.follows.findMany.mockResolvedValue([{followed: 'lgrati'}, {followed: 'gstfrenkel'}]);
    
        await controller.viewFollowed({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('Count', () => {   
    test('Successfully', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{followers: 0, followed: 0, following: false}]);
    
        await controller.count({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual({followers: 0, followed: 0, following: false});
    });

    test('Unuccessfully', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error(''));
    
        await controller.count({params: {target: 'pmartin'}, query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });
});
