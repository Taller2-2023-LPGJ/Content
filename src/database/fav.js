const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');

const pageSize = 10;

async function fav(id, username){
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
        throw new Exception('SnapMsg does not exist or was deleted.');

    try{
        const post = await prisma.favourites.create({
            data: {
                username: username,
                postId: id,
                creation: new Date()
            },
        });
    } catch(err){
        if(err.code == 'P2002')
            throw new Exception('SnapMsg has been already added to favourites list.', 403);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function unfav(id, username){
    const prisma = new PrismaClient();

    try{
        await prisma.favourites.delete({
            where: {
                username_postId: {
                    username: username,
                    postId: id
                }
            },
        });          
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg has not been been added to favourites list.', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function favs(username, page){
    const prisma = new PrismaClient();
    let offset = pageSize * page;
    
    try{
        return await prisma.$queryRaw`
            SELECT 
                id,
                author,
                body,
                "creationDate",
                "editingDate",
                COUNT(l."postId")::integer AS likes,
                ${username} = ANY (
                    SELECT username FROM likes l2 WHERE l2."postId" = id
                ) AS liked, (
                    SELECT array_agg(name)
                    FROM tags t INNER JOIN "postTags" pt ON t.id = pt."tagId"
                    WHERE pt."postId" = p.id
                ) AS tags,
                true AS fav
            FROM
                posts p
            INNER JOIN
                favourites f
                ON f."postId" = id
            LEFT JOIN
                likes l
                ON l."postId" = id
            WHERE
                f.username = ${username}
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
            GROUP BY id
            LIMIT ${pageSize} OFFSET ${pageSize * page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

module.exports = {
    fav,
    unfav,
    favs
};
