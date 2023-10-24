const { PrismaClient } = require('@prisma/client');
const Exception = require('../services/exception');


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
        await prisma.shares.deleteMany({
            where: {
                postId: id
            },
        });

        await prisma.posts.delete({
            where: {
                id: id,
                author: username,
            },
        });

        await prisma.postTags.deleteMany({
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

async function fetchPosts(username, page, parentId, author, body, size){
    const prisma = new PrismaClient();

    try{
        return await prisma.$queryRaw`
            WITH "tempPosts" AS (
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
                LEFT JOIN likes l ON l."postId" = id
                LEFT JOIN shares s ON s."postId" = id
                WHERE
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
                    author = COALESCE(${author}, author)
                    AND "parentId" = ${parentId}
                    AND (
                        LOWER(body) LIKE '% ' || LOWER(${body}) || '%'
                        OR LOWER(body) LIKE LOWER(${body}) || '%'
                    )
            
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
                    AND ${body} = ''
                    AND CASE 
                        WHEN ${author}::text IS NOT NULL THEN s.username = ${author}
                    ELSE (
                        s.username = ${username}
                        OR EXISTS(
                            SELECT 1
                            FROM follows
                            WHERE follower = ${username} AND followed = s.username
                        )
                    ) END
            ) ORDER BY
                CASE
                    WHEN author = ${username} OR "sharedBy" = ${username} THEN 0
                    WHEN EXISTS(
                        SELECT 1
                        FROM follows
                        WHERE follower = ${username} AND followed = (
                            CASE
                                WHEN "sharedBy" IS NULL THEN author
                            ELSE
                                "sharedBy"
                            END
                        )
                    ) THEN 0
                    ELSE 1
                END,
                COALESCE("sharedAt", "creationDate") DESC
            LIMIT ${size} OFFSET ${size * page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function fetchPost(username, id){
    const prisma = new PrismaClient();

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
            LEFT JOIN likes l ON l."postId" = id
            LEFT JOIN shares s ON s."postId" = id
            WHERE
                p.id = ${id}
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
            GROUP BY id;`;
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
    fetchPost,
    addTags,
    editTags,
};
