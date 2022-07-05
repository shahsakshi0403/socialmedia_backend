const { BadRequest } = require('../../error/apiError');
const {
    // getPost,
    createPost,
    updatePost,
    existsPostByID,
    getPostAggregate,
    likeAction,
    dislikeAction,
    existsUser,
    TopActions,
    getPostById,
    deletePostById
} = require('../../models/posts/posts.model');
const { getPagination } = require('../../services/paging');

//create-update post
async function httpCreatePost(req, res, next) {
    try {
        const newPost = req.body;
        postId = newPost._id;
        authId = req.userId;
        if (postId) {
            const existsUser = await existsPostByID(postId);
            if (existsUser) {
                if (existsUser.authId == authId) {
                    await updatePost(postId, newPost);
                    res.status(200).json({ status: 'Record Updated!' });
                } else {
                    next(new BadRequest("You can't update other user post"));
                    //res.status(400).json({ status: 'You cant update other user post' });
                }
            } else {
                next(new BadRequest("Invalid Post ID"))
                //res.status(400).json({ status: 'Invalid Post ID' });
            }
        } else {
            newPost.authId = authId;
            await createPost(newPost);
            res.status(200).json({ status: "Post Create successfully!!" });
        }
    } catch (err) {
        next(err);
        //next(new BadRequest(`Post can't Create/Update. ${err}`));
        //next(new Error(`Post can't Create/Update. ${err}`));
    }
}

//get post by id
//Added this api in frontend task its not part of backend Final task
async function httpGetPostById(req, res, next) {
    try {
        let id = req.params.id;
        let post = await getPostById(id);
        res.status(200).json(post);
    }
    catch (err) {
        next(err);
    }
}

//get posts
async function httpGetPost(req, res, next) {
    try {
        const key = req.query.sortByKey || '_id';
        const value = req.query.sortByValue || 1;
        const title = req.query.title;
        const content = req.query.content;
        const like = req.query.like;
        const dislike = req.query.dislike;
        const createdAt = req.query.createdAt;
        const updatedAt = req.query.updatedAt;
        const start = req.query.start;
        const end = req.query.end;
        const fieldName = req.query.fieldName;
        const { skip, limit } = getPagination(req.query);

        const pipeline = [];
        let query = {};
        if (title !== undefined) {
            query = {
                ...query,
                title: { $regex: title, $options: 'i' }
            }
        }
        if (content !== undefined) {
            query = {
                ...query,
                content: { $regex: content, $options: 'i' }
            }
        }
        if (like !== undefined) {
            query = {
                ...query,
                $expr: {
                    [`$${like.split(":")[0]}`]: [{ $size: "$likes" }, parseInt(like.split(":")[1])]
                }
            }
        }
        if (dislike !== undefined) {
            if (query.$expr) {
                query = {
                    ...query,
                    $and: [
                        {
                            $expr: query.$expr,
                        }, {
                            $expr: {
                                [`$${dislike.split(":")[0]}`]: [{ $size: "$dislikes" }, parseInt(dislike.split(":")[1])],
                            }
                        }
                    ],
                }
            } else {
                query = {
                    ...query,
                    $expr: {
                        [`$${dislike.split(":")[0]}`]: [{ $size: "$dislikes" }, parseInt(dislike.split(":")[1])]
                    }
                }
            }
            // query = {
            //     ...query,
            //     $expr: {
            //         [`$${dislike.split(":")[0]}`]: [{ $size: "$dislikes" }, parseInt(dislike.split(":")[1])]
            //     }
            // }
        }

        if (createdAt !== undefined) {
            query = {
                ...query,
                createdAt: {
                    [`$${createdAt.split(":")[0]}`]: new Date(createdAt.split(":")[1])
                }
            }
        }

        if (updatedAt !== undefined) {
            query = {
                ...query,
                updatedAt: {
                    [`$${updatedAt.split(":")[0]}`]: new Date(updatedAt.split(":")[1])
                }
            }
        }

        if (start !== undefined && end !== undefined && fieldName != undefined) {
            query = {
                ...query,
                [fieldName]: {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
            }
        }

        pipeline.push({ $match: query });
        pipeline.push(
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    authId: 1,
                    totalLikes: { $size: "$likes" },
                    totalDislikes: { $size: "$dislikes" },
                    likes: {
                        $slice: ["$likes", -2]
                    },
                    dislikes: {
                        $slice: ["$dislikes", -2]
                    }
                }
            });
        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "authId",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            firstName: 1,
                            lastName: 1
                        }
                    }],
                    as: "userDetail"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "likes",
                    foreignField: "_id",
                    pipeline: [{
                        $project: {
                            firstName: 1,
                            lastName: 1
                        }
                    }],
                    as: "recentlyLikedUsers"
                }
            }, {
            $lookup: {
                from: "users",
                localField: "dislikes",
                foreignField: "_id",
                pipeline: [{
                    $project: {
                        firstName: 1,
                        lastName: 1
                    }
                }],
                as: "recentlyDislikedUsers"
            }
        }, {
            $sort: {
                [key]: Number(value)
            }
        }, {
            $skip: skip
        }, {
            $limit: limit
        });

        let posts = await getPostAggregate(pipeline);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
        //next(new BadRequest("Post can't Display"));
        //next(new Error("Post can't Display"));
    }
    //let post = await getPost(skip, limit, key, value, title, content, like, dislike);
    // for (let i = 0; i < post.length; i++) {
    //     totalLikes = post[i].likes.length;
    //     totalDislikes = post[i].dislikes.length;
    //     post[i] = { post: post[i], TotalLikes: totalLikes, TotalDislikes: totalDislikes }
    // }
    //res.status(200).json(post);
}

//like-dislike post
async function httpPostActions(req, res, next) {
    try {
        const postId = req.body._id;
        const action = req.body.action;
        const authId = req.userId;
        const existsPost = await existsPostByID(postId);
        if (existsPost) {
            if (action == 'like') {
                await likeAction(postId, authId);
                res.status(200).json({ status: "liked Post" });
            }
            else if (action == 'dislike') {
                await dislikeAction(postId, authId);
                res.status(200).json({ status: "disliked Post" });
            }
            else {
                next(new BadRequest("Action field allows 'like' & 'dislike' value"));
                //res.status(400).json({ status: "Action field allows 'like' & 'dislike' value" });
            }
        }
        else {
            next(new BadRequest("No Post Available!!"))
            //res.status(400).json({ status: "No Post Available!" });
        }
    } catch (err) {
        next(err);
        //next(new BadRequest(`Post can't like/dislike`));
        //next(new Error("Post Action Error"));
    }
}

//get top like/dislike posts
async function httpTopActions(req, res, next) {
    try {
        const userId = req.query.id;
        //this line will not work with frontend so if you run only backend then this line uncomment please.
        //const action = req.query.action || 'likes';

        //this line will not work with backend so if you run only backend-frontend then this line works.
        const action = req.params.action || 'likes';
        const value = Number(req.query.limit) || 10;

        if (userId) {
            if (await existsUser(userId)) {
                const user = await TopActions(action, value, userId);
                res.status(200).json({ user });
            }
            else {
                next(new BadRequest("No User Found"));
                //res.status(400).json({ status: "No User Found" });
            }
        }
        else {
            const user = await TopActions(action, value, userId);
            res.status(200).json(user);
        }
    } catch (err) {
        next(err);
        //next(new BadRequest(`Post Top like/dislike Action Error ${err}`))
        //next(new Error("Post Top like/dislike Action Error"));
    }
}

async function httpDeletePost(req,res,next){
    try{
        const id = req.params.id;
        await deletePostById(id);
        res.status(200).json({status : 'Delete Successfully!!'});
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    httpCreatePost,
    httpGetPostById,
    httpGetPost,
    httpPostActions,
    httpTopActions,
    httpDeletePost
}