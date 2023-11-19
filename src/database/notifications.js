const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');

async function create(data){
    const prisma = new PrismaClient();
    let post = null;

    try{
        await prisma.notifications.create({
            data: data,
        });
    } catch(err){
        console.log(err);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function delet(id){
    const prisma = new PrismaClient();
    try{
        await prisma.notifications.delete({
            where: {
                id: id
            },
        });
    } catch(err){
        console.log(err);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function notifications(username){
    const prisma = new PrismaClient();
    var where = {};
    if(username){
        where.subID = username;
    }

    try{
        return await prisma.notifications.findMany({
            where: where
        });
    } catch(err){
        console.log(err);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

module.exports = {
    create,
    delet,
    notifications
};
