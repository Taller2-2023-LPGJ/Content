const prisma = require('./client');
const Exception = require('../services/exception');

const pageSize = 10;

async function fav(id, username){
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
        throw new Exception('SnapMsg does not exist or has been deleted.', 404);

    try{
        await prisma.favourites.create({
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
    }
}

async function unfav(id, username){
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
            throw new Exception('SnapMsg does not exist, has been deleted, or has not been been added to favourites list.', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function favs(username, page){
    try{
        return await prisma.$queryRaw`
            SELECT 
                id,
                "parentId",
                author,
                body,
                private,
                "creationDate",
                "editingDate",
                COUNT(DISTINCT l.username)::integer AS likes,
                COUNT(DISTINCT s.username)::integer AS shares, (
                    SELECT COUNT(1)::integer FROM posts p2 WHERE p2."parentId" = p.id
                ) AS replies,
                ${username} = ANY (
                    SELECT username FROM likes l2 WHERE l2."postId" = id
                ) AS liked,
                ${username} = ANY (
                    SELECT username FROM shares s2 WHERE s2."postId" = id
                ) AS shared, (
                    SELECT array_agg(name)
                    FROM tags t INNER JOIN "postTags" pt ON t.id = pt."tagId"
                    WHERE pt."postId" = p.id
                ) AS tags, EXISTS (
                    SELECT 1
                    FROM favourites f
                    WHERE f."postId" = id AND f.username = ${username}
                ) AS fav
            FROM
                posts p
            INNER JOIN favourites f ON f."postId" = id
            LEFT JOIN likes l ON l."postId" = id
            LEFT JOIN shares s ON s."postId" = id
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
            GROUP BY id, f.creation
            ORDER BY f.creation DESC
            LIMIT ${pageSize} OFFSET ${pageSize * page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

module.exports = {
    fav,
    unfav,
    favs
};
