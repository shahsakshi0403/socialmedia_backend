const { mongoose } = require('mongoose');
const postDatabase = require('./posts.mongo');
const ObjectId = require('mongoose').Types.ObjectId;

//create new post
async function createPost(createUser) {
    await postDatabase.create(createUser);
}

//check post exists or not
async function existsPostByID(postId) {
    return mongoose.isValidObjectId(postId) && await postDatabase.findOne({ _id: postId });
}

//update post
async function updatePost(id, updatePost) {
    const existingPost = await existsPostByID(updatePost.id);
    const { title, content } = existingPost;

    updatePost.title = (updatePost.title == undefined) ? title : updatePost.title;
    updatePost.content = (updatePost.content == undefined) ? content : updatePost.content;
    updatePost.updatedAt = Date.now();
    await postDatabase.updateOne({ _id: id }, updatePost);
}

//Added this api in frontend task its not part of backend Final task
async function getPostById(id) {
    return await postDatabase.findOne({ _id: id });
}

async function getPostAggregate(pipeline) {
    return await postDatabase.aggregate(pipeline);
}

//get all post with filters
// async function getPost(skip, limit, key, value, title, content, like, dislike) {   
//     return await postDatabase.find({ query }, { __v: 0, likes: { $slice: -2 }, dislike: { $slice: -2 } })
//         .populate({ path: 'authId', select: ['firstName', 'lastName', 'email', 'userName'] })
//         .populate({
//             path: 'likes',
//             select: ['firstName', 'lastName']
//         })
//         .populate({
//             path: 'dislikes',
//             select: ['firstName', 'lastName']
//         })
//         .sort({ [key]: value })
//         .skip(skip)
//         .limit(limit);
// }

//if authId is present in dislikes array then it will pull that id from dislikes array and push it to likes array 
async function likeAction(postId, authId) {
    return await postDatabase.findByIdAndUpdate({ _id: postId }, {
        $addToSet: {
            likes: authId
        },
        $pull: {
            dislikes: authId
        }
    }, {
        new: true,
    });
}

//if authId is present in likes array then it will pull that id from likes array and push it to dislikes array
async function dislikeAction(postId, authId) {
    return await postDatabase.findByIdAndUpdate({ _id: postId }, {
        $addToSet: {
            dislikes: authId
        },
        $pull: {
            likes: authId
        }
    }, {
        new: true,
    });
}

//check userId is exists or not in database
async function existsUser(userId) {
    return mongoose.isValidObjectId(userId) && await postDatabase.findOne({ authId: userId });
}

async function topLikesAction(req, res, next) {
    return await postDatabase.aggregate([
        {
            $match: {
                authId: ObjectId(userId)
            }
        }, {
            $addFields: {
                totalCount: {
                    $size: "$" + action
                }
            }
        },
        {
            $sort: { totalCount: -1 }
        },
        {
            $limit: value || 10
        }
    ]);
}

async function topDislikesAction(req, res, next) {
    return await postDatabase.aggregate([
        {
            $addFields: {
                totalCount: {
                    $size: "$" + action
                }
            }
        },
        {
            $sort: { totalCount: -1 }
        },
        {
            $limit: value || 10
        }
    ]);
}

//get top likes post from database & if specific id is given then shows that userId's top most likes post
async function TopActions(action, value, userId) {
    if (userId) {
        return await postDatabase.aggregate([{
            $match: {
                authId: ObjectId(userId)
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $size: "$" + action
                }
            }
        },
        {
            $sort: { totalLikes: -1 }
        },
        // {
        //     $addFields: {
        //         totaldislikes: {
        //             $size: "$" + action
        //         }
        //     }
        // },
        // {
        //     $sort: { totaldislikes: -1 }
        // },
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
            $limit: value
        }]);
    } else {
        return await postDatabase.aggregate([{
            $addFields: {
                totalLikes: {
                    $size: "$" + action
                }
            }
        },
        {
            $sort: { totalLikes: -1 }
        },
        // {
        //     $addFields: {
        //         totalDislikes: {
        //             $size: "$" + action
        //         }
        //     }
        // },
        // {
        //     $sort: { totalDislikes: -1 }
        // },
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
            $limit: value
        }]);
    }
}

async function deletePostById(id) {
    return await postDatabase.deleteOne({ _id: id });
}

module.exports = {
    createPost,
    updatePost,
    existsPostByID,
    getPostById,
    getPostAggregate,
    //getPost,
    likeAction,
    dislikeAction,
    existsUser,
    TopActions,
    topDislikesAction,
    topLikesAction,
    deletePostById
}