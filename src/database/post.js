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
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg not found', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function fetchPosts(username, parentId, page){
    const prisma = new PrismaClient();

    try{
        return await prisma.$queryRaw`
            SELECT 
                id,
                author,
                body,
                "creationDate",
                "editingDate"
            FROM
                posts
            WHERE
                "parentId" = ${parentId} AND (
                    private = false OR
                    private = (
                        CASE WHEN ${username} = author THEN true
                        ELSE EXISTS(
                            SELECT 1
                            FROM follows
                            WHERE follower = ${username} AND followed = author
                        ) AND 
                        EXISTS(
                            SELECT 1
                            FROM follows
                            WHERE follower = author AND followed = ${username}
                        )
                        END
                    )
                )
            ORDER BY
                CASE WHEN
                    EXISTS(
                        SELECT 1
                        FROM follows
                        WHERE follower = ${username} AND followed = author
                    ) THEN 0
                    ELSE 1
                END,
                "creationDate" DESC
            LIMIT ${pageSize} OFFSET ${pageSize * page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function fetchUserPosts(username, author, page){
    const prisma = new PrismaClient();

    try{
        let dualFollow = await prisma.$queryRaw`
            SELECT 
                EXISTS(
                    SELECT 1
                    FROM follows
                    WHERE follower = ${username} AND followed = ${author}
                ) AND 
                EXISTS(
                    SELECT 1
                    FROM follows
                    WHERE follower = ${author} AND followed = ${username}
                ) AS result`;
                
        dualFollow = dualFollow[0].result || author === username;

        return await prisma.$queryRaw`
            SELECT 
                id,
                author,
                body,
                "creationDate",
                "editingDate"
            FROM
                posts
            WHERE
                "parentId" = 0 AND
                author = ${author} AND (
                    private = false OR
                    private = ${dualFollow}
                )
            ORDER BY
                "creationDate" DESC
            LIMIT ${pageSize} OFFSET ${pageSize * page};`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

async function fetchTags(parentId, ids){
    const prisma = new PrismaClient();
    const tags = {};

    try{
        for (const id of ids){
            const postTags = await prisma.$queryRaw`
                SELECT name
                FROM tags
                INNER JOIN "postTags" ON "tagId" = id
                WHERE "postId" = CAST(${id} AS INTEGER)`;

            tags[id] = postTags.map((postTag) => postTag.name);
        }

        return tags;
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
    fetchUserPosts,
    addTags,
    editTags,
    fetchTags,
};
