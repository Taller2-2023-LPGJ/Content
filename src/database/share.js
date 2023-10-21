const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');

async function share(id, username){
    const prisma = new PrismaClient();
    let post = null;

    try{
        post = await prisma.$queryRaw`
            SELECT 1 as post
            FROM posts
            WHERE
                id = ${id}
                AND (
                    private = false
                    OR (
                        private = true
                        AND (
                            author = ${username}
                            OR 2 = (
                                SELECT COUNT(1)
                                FROM follows
                                WHERE (
                                    (follower = ${username} AND followed = author)
                                    OR (followed = ${username} AND follower = author))
                            )
                        )                      
                    )
                )        
            ;`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }

    if(!post || post.length === 0 || post[0].post != 1)
        throw new Exception('SnapMsg does not exist or was deleted.', 404);

    try{
        const post = await prisma.shares.create({
            data: {
                username: username,
                postId: id,
                creation: new Date()
            },
        });
    } catch(err){
        if(err.code == 'P2002')
            throw new Exception('SnapMsg has been already shared.', 403);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function unshare(id, username){
    const prisma = new PrismaClient();

    try{
        await prisma.shares.delete({
            where: {
                username_postId: {
                    username: username,
                    postId: id
                }
            },
        });          
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg does not exist, has been deleted, or has not been been previously shared.', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

module.exports = {
    share,
    unshare
};
