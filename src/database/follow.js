const prisma = require('./client');
const Exception = require('../services/exception');

const pageSize = 10;

async function follow(follower, followed){
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
    }
}

async function unfollow(follower, followed){
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
    } 
}

async function isFetchAuthorized(username, target){
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
    }
}

async function viewFollowers(target, page){
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
    }
}

async function viewFollowed(target, page, all = false){
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
    }
}

async function count(target, username){
    try {
        const result = await prisma.$queryRaw`
            SELECT (
                SELECT COUNT(1)::integer
                FROM follows
                WHERE follower = ${target}
            ) AS followed, (
                SELECT COUNT(1)::integer
                FROM follows
                WHERE followed = ${target}
            ) AS followers, EXISTS (
                SELECT 1
                FROM follows
                WHERE
                    followed = ${target}
                    AND follower = ${username}
            ) as following;
        `;

        return result[0];
    } catch(err) {
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
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
