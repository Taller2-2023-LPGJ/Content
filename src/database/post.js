const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');

const pageSize = 20;

async function createPost(parentId, username, body, private){
    const prisma = new PrismaClient();

    try{
        const post = await prisma.posts.create({
            data: {
                parentId: parentId,
                author: username,
                body: body,
                private: private,
                creationDate: new Date(),
                editingDate: null
            },
        });

        return post.id;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function addTags(id, tags){
    const prisma = new PrismaClient();

    try{
        const tagsIds = await prisma.tags.findMany({
            where: {
                name: {
                    in: tags
                }
            },
            select: {
                id: true
            }
        });

        const postTagPairs = Object.values(tagsIds).map((tagId) => ({
            postId: id,
            tagId: tagId.id,
        }));

        await prisma.postTags.createMany({
            data: postTagPairs,
        });
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function editPost(id, username, body, private){
    const prisma = new PrismaClient();

    try{
        await prisma.posts.update({
            where: {
                id: id,
                author: username,
            },
            data: {
                body: body,
                private: private,
                editingDate: new Date(),
            },
        });
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg not found', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function editTags(id, tags){
    const prisma = new PrismaClient();

    try{
        await prisma.postTags.deleteMany({
            where: {
                postId: id
            },
        });
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }

    try{
        await addTags(id, tags);
    } catch(err){
        throw err;
    }
}

async function deletePost(id, username){
    const prisma = new PrismaClient();

    try{
        await prisma.posts.delete({
            where: {
                id: id,
                author: username,
            },
        });

        await prisma.postTags.deleteMany({
            where: {
                id: id
            },
        });  

        await prisma.shares.deleteMany({
            where: {
                postId: id
            },
        });  
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg not found', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function fetchPosts(username, page, parentId, author){
    const prisma = new PrismaClient();

    try{
        return await prisma.$queryRaw`
            WITH "tempPosts" AS (
                SELECT 
                    id,
                    "parentId",
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
                    ) AS tags, EXISTS (
                        SELECT 1
                        FROM favourites f
                        WHERE f."postId" = id AND f.username = ${username}
                    ) AS fav
                FROM
                    posts p
                LEFT JOIN likes l ON l."postId" = id
                WHERE
                    author = COALESCE(${author}, author)
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
            )
            
            SELECT * FROM (
                SELECT
                    b.*,
                    null "sharedAt",
                    null "sharedBy"
                FROM
                    "tempPosts" b
                WHERE
                    "parentId" = ${parentId}
            
                UNION ALL
            
                SELECT
                    a.*,
                    s.creation AS "sharedAt",
                    s.username AS "sharedBy"
                FROM
                    "tempPosts" a
                INNER JOIN shares s ON s."postId" = id
                WHERE
                    ${parentId} = 0
                    AND CASE 
                        WHEN ${author}::text IS NOT NULL THEN (s.username = 'gstfrenkel' OR s.username IS NULL)
                    ELSE (
                        s.username = ${username}
                        OR EXISTS(
                            SELECT 1
                            FROM follows
                            WHERE follower = ${username} AND followed = author
                        )
                    ) END
            ) ORDER BY
                CASE
                    WHEN author = ${username} THEN 0
                    WHEN EXISTS(
                        SELECT 1
                        FROM follows
                        WHERE follower = ${username} AND followed = author
                    ) THEN 0
                    ELSE 1
                END,
                COALESCE("sharedAt", "creationDate") DESC
            LIMIT ${pageSize} OFFSET ${pageSize} * ${page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
    addTags,
    editTags,
};
