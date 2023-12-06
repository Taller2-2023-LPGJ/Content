const controller = require('../src/controllers/fav');
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

describe('Favourite', () => {   
    test('Successfully', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.favourites.create.mockResolvedValue();
    
        await controller.fav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully 1', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error(''));
    
        await controller.fav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Unsuccessfully 2', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.favourites.create.mockRejectedValue(new Error(''));
    
        await controller.fav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Invalid ID', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.favourites.create.mockResolvedValue();
    
        await controller.fav({params: {id: '10abc'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Private', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 0}]);
        prismaMock.favourites.create.mockResolvedValue();
    
        await controller.fav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Duplicate', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{post: 1}]);
        prismaMock.favourites.create.mockRejectedValue(new PrismaError('', 'P2002'));
    
        await controller.fav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(403);
    });
});

describe('Unfavourite', () => {   
    test('Successfully', async () => {
        prismaMock.favourites.delete.mockResolvedValue();
    
        await controller.unfav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
    });

    test('Unsuccessfully', async () => {
        prismaMock.favourites.delete.mockRejectedValue(new Error(''));
    
        await controller.unfav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Invalid ID', async () => {
        prismaMock.favourites.delete.mockResolvedValue();
    
        await controller.unfav({params: {id: '10abc'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });

    test('Private', async () => {
        prismaMock.favourites.delete.mockRejectedValue(new PrismaError('', 'P2025'));
    
        await controller.unfav({params: {id: '10'}, body: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(404);
    });
});

describe('Posts', () => {   
    test('Successfully', async () => {
        axiosMock.post.mockResolvedValue({data: {
            'gstfrenkel': {displayName: 'Gaston Frenkel', picture: '', verified: true},
            'lgrati': {displayName: 'Lucas Grati', picture: '', verified: false},
            'pmartin': {displayName: 'Pablo Martín', picture: '', verified: false},
        }});
        prismaMock.$queryRaw.mockResolvedValue([{author: 'gstfrenkel'}, {author: 'pmartin'}, {author: 'lgrati'}]);
    
        await controller.favs({query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual([
            {author: 'gstfrenkel', displayName: 'Gaston Frenkel', picture: '', verified: true},
            {author: 'pmartin', displayName: 'Pablo Martín', picture: '', verified: false},
            {author: 'lgrati', displayName: 'Lucas Grati', picture: '', verified: false},
        ]);
    });

    test('Unuccessfully', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error(''));
    
        await controller.favs({query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).not.toEqual(200);
    });

    test('Empty', async () => {
        axiosMock.post.mockResolvedValue({data: {}});
        prismaMock.$queryRaw.mockResolvedValue([]);
    
        await controller.favs({query: { username: 'gstfrenkel' } }, res);

        expect(res.statusVal).toEqual(200);
        expect(res.jsonVal).toEqual([]);
    });
});
