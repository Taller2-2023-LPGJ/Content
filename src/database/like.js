const prisma = require('./client');
const Exception = require('../services/exception');

async function like(id, username){
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
                );`;
    } catch(err){
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }

    if(!post || post.length === 0 || post[0].post != 1)
        throw new Exception('SnapMsg does not exist or has been deleted.', 404);

    try{
        await prisma.likes.create({
            data: {
                username: username,
                postId: id,
                creation: new Date()
            },
        });
    } catch(err){
        if(err.code == 'P2002')
            throw new Exception('SnapMsg has been already liked.', 403);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function unlike(id, username){
    try{
        await prisma.likes.delete({
            where: {
                username_postId: {
                    username: username,
                    postId: id
                }
            },
        });          
    } catch(err){
        if(err.code == 'P2025')
            throw new Exception('SnapMsg does not exist, has been deleted, or has not been liked.', 404);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    }
}

async function numberLikes(username, startdate, finaldate){
    const prisma = new PrismaClient();
    try{
        if(startdate || finaldate){
            if(startdate && finaldate){
                startdate = new Date(startdate);
                finaldate = new Date(new Date(finaldate).setUTCHours(23,59,59,999));
                var result = await prisma.$queryRaw`
                    SELECT 
                        COUNT(*)::integer
                    FROM
                        likes lk
                        JOIN posts p ON p.id = lk."postId"
                    WHERE
                        p.author = ${username} AND
                        lk."creation" >= ${startdate} AND
                        lk."creation" <= ${finaldate}
                        ;
                `;
                return result[0].count;
            }else if(startdate){
                startdate = new Date(startdate);
                var result = await prisma.$queryRaw`
                    SELECT 
                        COUNT(*)::integer
                    FROM
                        likes lk
                        JOIN posts p ON p.id = lk."postId"
                    WHERE
                        p.author = ${username} AND
                        lk."creation" >= ${startdate}
                        ;
                `;
                return result[0].count;
            }else if(finaldate){
                finaldate = new Date(new Date(finaldate).setUTCHours(23,59,59,999));
                var result = await prisma.$queryRaw`
                    SELECT 
                        COUNT(*)::integer
                    FROM
                        likes lk
                        JOIN posts p ON p.id = lk."postId"
                    WHERE
                        p.author = ${username} AND
                        lk."creation" <= ${finaldate}
                        ;
                `;
                return result[0].count;
            }
        }else{
            var result = await prisma.$queryRaw`
                SELECT 
                    COUNT(*)::integer
                FROM
                    likes lk
                    JOIN posts p ON p.id = lk."postId"
                WHERE
                    p.author = ${username};
            `;
            return result[0].count;
        }
    } catch(err){
        console.log(err);
        throw new Exception('An unexpected error has occurred. Please try again later.', 500);
    } finally{
        await prisma.$disconnect();
    }
}

module.exports = {
    like,
    unlike,
    numberLikes
};
