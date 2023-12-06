const { AxiosError } = require('axios');
const controller = require('../src/controllers/post');
const service = require('../src/services/post');
const { axiosMock, prismaMock } = require('./singleton');
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

describe('New', () => {   
    test('Post', async () => {
        prismaMock.posts.create.mockResolvedValue({id: 1});
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        try{
            await service.createPost(undefined, 'gstfrenkel', 'Hii', undefined, ['Sports, Music']);
            expect(true).toEqual(true);
        } catch(_){
            expect(true).toEqual(false);
        }
    });

    test('Comment', async () => {
        prismaMock.posts.create.mockResolvedValue({id: 1});
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        try{
            await service.createPost(1, 'gstfrenkel', 'Hii comment', false, ['Sports, Music']);
            expect(true).toEqual(true);
        } catch(_){
            expect(true).toEqual(false);
        }
    });

    test('No Body', async () => {
        prismaMock.posts.create.mockResolvedValue({id: 1});
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        try{
            await service.createPost(1, 'gstfrenkel', '', false, ['Sports, Music']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });

    test('Body Too Long', async () => {
        prismaMock.posts.create.mockResolvedValue({id: 1});
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        try{
            await service.createPost(1, 'gstfrenkel', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', false, ['Sports, Music']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });

    test('Unsuccessfully', async () => {
        prismaMock.posts.create.mockRejectedValue(new Error(''));

        try{
            await service.createPost('SQL Injection', 'gstfrenkel', 'Test', true, ['Sports, Music']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.posts.create.mockResolvedValue({id: 1});
        prismaMock.tags.findMany.mockRejectedValue(new Error(''));

        try{
            await service.createPost(1, 'gstfrenkel', 'Test', true, ['Sports, Music']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });
});

describe('Edit', () => {   
    test('Post', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'Hiii', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).toEqual(200);
    });

    test('No Body', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: '', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Body Too Long', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).toEqual(403);
    });

    test('Non-Existent', async () => {
        prismaMock.posts.update.mockRejectedValue(new PrismaError('', 'P2025'));
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'Hola', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Unsuccessfully', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockRejectedValue(new Error(''));
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'Hola', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockRejectedValue(new Error(''));
        prismaMock.postTags.createMany.mockResolvedValue();

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'Hola', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 3', async () => {
        prismaMock.posts.update.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();
        prismaMock.tags.findMany.mockResolvedValue([0, 1]);
        prismaMock.postTags.createMany.mockRejectedValue(new Error(''));

        await controller.editPost({params: {id: '1'}, body: {username: 'gstfrenkel', body: 'Hola', private: false, tags: ['Sports', 'Music']}}, res);

        expect(res.statusVal).not.toEqual(200);
    });
});

describe('Delete', () => {   
    test('Post', async () => {
        prismaMock.shares.deleteMany.mockResolvedValue();
        prismaMock.posts.delete.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();

        await controller.deletePost({params: {id: '1'}, body: {username: 'gstfrenkel'}}, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Non-Existent', async () => {
        prismaMock.shares.deleteMany.mockRejectedValue(new PrismaError('', 'P2025'));
        prismaMock.posts.delete.mockResolvedValue();
        prismaMock.postTags.deleteMany.mockResolvedValue();

        await controller.deletePost({params: {}, body: {username: 'gstfrenkel'}}, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Unsuccessfully', async () => {
        prismaMock.shares.deleteMany.mockResolvedValue();
        prismaMock.posts.delete.mockRejectedValue(new Error(''));
        prismaMock.postTags.deleteMany.mockResolvedValue();

        await controller.deletePost({params: {id: '1'}, body: {username: 'gstfrenkel'}}, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.shares.deleteMany.mockResolvedValue();
        prismaMock.posts.delete.mockResolvedValue(new Error(''));
        prismaMock.postTags.deleteMany.mockRejectedValue(new Error(''));

        await controller.deletePost({params: {id: '1'}, body: {username: 'gstfrenkel'}}, res);

        expect(res.statusVal).not.toEqual(200);
    });
});

describe('Profile Data', () => {   
    test('Successfully', async () => {
        axiosMock.post.mockResolvedValue({data: [{username: 'gstfrenkel'}, {username: 'lgrati'}]});

        try{
            const result = await service.fetchProfileData(['gstfrenkel', 'lgrati']);
            expect(result).toEqual([{username: 'gstfrenkel'}, {username: 'lgrati'}]);
        } catch(_){
            expect(true).toEqual(false);
        }
    });

    test('Unsuccessfully', async () => {
        axiosMock.post.mockResolvedValue();

        try{
            await service.fetchProfileData(['gstfrenkel', 'lgrati']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });

    test('Unsuccessfully 2', async () => {
        axiosMock.post.mockRejectedValue(new Error(''));

        try{
            await service.fetchProfileData(['gstfrenkel', 'lgrati']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });

    test('Unsuccessfully 3', async () => {
        axiosMock.post.mockRejectedValue(new AxiosError(''));

        try{
            await service.fetchProfileData(['gstfrenkel', 'lgrati']);
            expect(true).toEqual(false);
        } catch(_){
            expect(true).toEqual(true);
        }
    });
});
