const prisma = require('./client');
const Exception = require('../services/exception');

async function fetchPosts(id, parentId, author, body, private, page, size){
    try{
        const posts = await prisma.$queryRaw`
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
                ) AS replies, (
                    SELECT array_agg(name)
                    FROM tags t INNER JOIN "postTags" pt ON t.id = pt."tagId"
                    WHERE pt."postId" = p.id
                ) AS tags,
                blocked
            FROM
                posts p
            LEFT JOIN likes l ON l."postId" = id
            LEFT JOIN shares s ON s."postId" = id
            WHERE
                id = COALESCE(${id}, id)
                AND "parentId" = COALESCE(${parentId}, "parentId")
                AND private = COALESCE(${private}, private)
                AND LOWER(author) LIKE '%' || LOWER(${author}) || '%'             
                AND LOWER(body) LIKE '%' || LOWER(${body}) || '%'             
            GROUP BY id            
            ORDER BY "parentId" ASC, id ASC
            LIMIT ${size} OFFSET ${size * page};`;

        const postCount = await prisma.$queryRaw`
            SELECT 
                COUNT(DISTINCT id)::integer
            FROM
                posts p
            WHERE
                id = COALESCE(${id}, id)
                AND "parentId" = COALESCE(${parentId}, "parentId")
                AND private = COALESCE(${private}, private)
                AND LOWER(author) LIKE '%' || LOWER(${author}) || '%'             
                AND LOWER(body) LIKE '%' || LOWER(${body}) || '%'`;

        return [postCount[0].count, posts];
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function editPost(id, blocked){
    try{
        await prisma.posts.update({
            where: {
                id: id,
            },
            data: {
                blocked: blocked,
            },
        });
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg not found.', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

module.exports = {
    fetchPosts,
    editPost
};
