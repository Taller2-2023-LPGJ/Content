const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');

const pageSize = 10;

async function follow(follower, followed){
    const prisma = new PrismaClient();

    try{
        await prisma.follows.create({
            data: {
                followed,
                follower
            },
        });
    } catch(err){
        if(err.code == 'P2002') 
            throw new Exception('User is already being followed.', 403);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function unfollow(follower, followed){
    const prisma = new PrismaClient();

    try {
        await prisma.follows.delete({
            where: {
                followed_follower:{
                    followed: followed,
                    follower: follower,
                },
            },
        });
    } catch(err) {
        if(err.code == 'P2025') 
            throw new Exception('User is not being followed.', 403);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function isFetchAuthorized(username, target){
    const prisma = new PrismaClient();
    
    try {
        const isUserFollowingTarget = await prisma.follows.findFirst({
            where: {
                followed: target,
                follower: username,
            }
        });

        const isUserFollowedByTarget = await prisma.follows.findFirst({
            where: {
                followed: username,
                follower: target,
            }
        });

        return isUserFollowingTarget && isUserFollowedByTarget;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function viewFollowers(target, page){
    const prisma = new PrismaClient();

    try {
        return await prisma.follows.findMany({
            where: {
                followed: target
            },
            select: {
                follower: true
            },
            skip: page * pageSize,
            take: pageSize
        });
    } catch(_) {
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function viewFollowed(target, page, all = false){
    const prisma = new PrismaClient();

    let query = {
        where: {
            follower: target
        },
        select: {
            followed: true
        }
    };

    if(!all){
        query.skip = page * pageSize;
        query.take = pageSize;
    }

    try {
        return await prisma.follows.findMany(query);
    } catch(_) {
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function count(username){
    const prisma = new PrismaClient();

    try {
        const followers = await prisma.follows.count({
            where: {
                followed: username
            }
        });

        const followed = await prisma.follows.count({
            where: {
                follower: username
            }
        });

        return {followers: followers, followed: followed};
    } catch(_) {
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

module.exports = {
    follow,
    unfollow,
    isFetchAuthorized,
    viewFollowers,
    viewFollowed,
    count,
};
