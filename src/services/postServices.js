import { Op } from "sequelize";
import _ from "lodash";

import db, { sequelize } from "../models";

const create = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.content && data.userId) {
                const lastestPost = await db.Post.create({
                    content: data.content,
                    status: data.status,
                    userId: data.userId,
                    allowComment: data.allows.includes("comment")
                        ? true
                        : false,
                    allowSave: data.allows.includes("save") ? true : false,
                    mode: data.mode,
                });

                if (data.photos && data.photos.length > 0) {
                    const postId = lastestPost.dataValues.id;

                    data.photos.map(async (photo) => {
                        await db.Photo.create({
                            source: photo,
                            postId: postId,
                        });
                    });
                }

                resolve({
                    errCode: 0,
                    message: "Created post succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const update = (data, postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data && postId) {
                const postCount = await db.Post.count({
                    where: {
                        id: postId,
                    },
                });

                if (postCount > 0) {
                    await db.Post.update(
                        {
                            content: data.content,
                            status: data.status,
                            allowComment: data.allows.includes("comment")
                                ? true
                                : false,
                            allowSave: data.allows.includes("save")
                                ? true
                                : false,
                            mode: data.mode,
                        },
                        {
                            where: {
                                id: postId,
                            },
                        }
                    );

                    if (data.photos && data.photos.length > 0) {
                        data.photos.map(async (photo) => {
                            await db.Photo.create({
                                source: photo,
                                postId,
                            });
                        });
                    }

                    if (!data.allows.includes("save")) {
                        await db.SavedPost.update(
                            {
                                status: "reject",
                            },
                            {
                                where: { postId },
                            }
                        );
                    } else {
                        await db.SavedPost.update(
                            {
                                status: "resolve",
                            },
                            {
                                where: { postId },
                            }
                        );
                    }

                    resolve({
                        errCode: 0,
                        message: "Updated post succeed",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Not found any post",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const user = await db.User.findOne({
                    where: {
                        id: userId,
                    },
                });

                if (!_.isEmpty(user)) {
                    delete user.password;
                }

                resolve(user);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getLikeCount = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const likeCount = await db.LikeHistory.count({
                    where: {
                        postId,
                    },
                });

                resolve(likeCount);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getCommentCount = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const commentCount = await db.CommentHistory.count({
                    where: { postId },
                });

                resolve(commentCount);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getComments = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const commentIds = await db.CommentHistory.findAll({
                    attributes: ["id"],
                    where: { postId },
                    order: [["id", "DESC"]],
                });

                const commentIdArr = commentIds.map(
                    (commentId) => commentId.id
                );

                if (commentIdArr && commentIdArr.length > 0) {
                    const output = await Promise.all(
                        commentIdArr.map(async (commentId) => {
                            const comment = await getCommentById(commentId);
                            return comment;
                        })
                    );

                    resolve(output);
                } else {
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getCommentById = (commentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (commentId) {
                const comment = await db.CommentHistory.findOne({
                    where: { id: commentId },
                });

                const replies = await getCommentReplies(commentId);

                comment.replies = replies;

                resolve(comment);
            } else {
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getCommentReplies = (commentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (commentId) {
                const commentReplies = await db.CommentReply.findAll({
                    where: { commentId },
                    order: [["id", "DESC"]],
                });

                resolve(commentReplies);
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getPhotosByPostId = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const photos = await db.Photo.findAll({
                    where: {
                        postId,
                    },
                });

                if (photos && photos.length > 0) {
                    resolve(photos);
                } else {
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getPostById = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const post = await db.Post.findOne({ where: { id: postId } });

                if (!_.isEmpty(post)) {
                    const author = await getUser(post.userId);
                    const likeCount = await getLikeCount(postId);
                    const commentCount = await getCommentCount(postId);
                    const photos = await getPhotosByPostId(postId);
                    const comments = await getComments(postId);
                    const usersLiked = await getUsersLikedPost(postId);

                    post.author = author;
                    post.likeCount = likeCount;
                    post.commentCount = commentCount;
                    post.photos = photos;
                    post.comments = comments;
                    post.usersLiked = usersLiked;

                    resolve(post);
                } else {
                    resolve({});
                }
            } else {
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getListPosts = (userId, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (page) {
                let posts;
                const postsPerPage = 3;
                const offset = (page - 1) * postsPerPage;

                if (userId) {
                    posts = await db.Post.findAll({
                        attributes: ["id"],
                        where: { userId },
                        offset: offset,
                        limit: postsPerPage,
                        order: [["id", "DESC"]],
                    });
                } else {
                    posts = await db.Post.findAll({
                        attributes: ["id"],
                        offset: offset,
                        limit: postsPerPage,
                        order: sequelize.random(),
                        where: {
                            mode: "global",
                        },
                    });
                }

                if (posts && posts.length > 0) {
                    const idArr = posts.map((post) => post.id);

                    const output = await Promise.all(
                        idArr.map(async (postId) => {
                            const post = await getPostById(postId);
                            return post;
                        })
                    );

                    resolve({
                        errCode: 0,
                        message: "Get posts succeed",
                        data: output,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "No posts yet",
                        data: [],
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDelete = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const postCount = await db.Post.count({
                    where: {
                        id: postId,
                    },
                });

                if (postCount > 0) {
                    await db.Post.destroy({ where: { id: postId } });
                    await db.LikeHistory.destroy({ where: { postId } });
                    await db.Photo.destroy({ where: { postId } });
                    await db.SavedPost.destroy({ where: { postId } });

                    const comments = await db.CommentHistory.findAll({
                        where: { postId },
                    });

                    const commentIdArr = comments.map((comment) => comment.id);
                    commentIdArr.forEach(async (commentId) => {
                        await db.CommentHistory.destroy({
                            where: { id: commentId },
                        });

                        await db.CommentReply.destroy({ where: { commentId } });
                    });

                    resolve({
                        errCode: 0,
                        message: "Delete success",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Not found post",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleLike = (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if ((userId, postId)) {
                await db.LikeHistory.create({
                    likeBy: userId,
                    postId: postId,
                });

                resolve({
                    errCode: 0,
                    message: "Liked",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getLikedPostsIdOfUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const likedPostsId = await db.LikeHistory.findAll({
                    where: {
                        likeBy: userId,
                    },
                    attributes: ["postId"],
                });

                if (likedPostsId && likedPostsId.length > 0) {
                    const output = likedPostsId.map((item) => item.postId);

                    resolve({
                        errCode: 0,
                        message: "Get liked posts id succeed",
                        data: output,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: `User don't like any post`,
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleUnlike = (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId && postId) {
                await db.LikeHistory.destroy({
                    where: {
                        likeBy: userId,
                        postId: postId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Deleted succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleCreateComment = (userId, postId, content) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId && postId && content) {
                await db.CommentHistory.create({
                    commentBy: userId,
                    postId: postId,
                    content: content,
                });

                resolve({
                    errCode: 0,
                    message: "Added a comment",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleCreateCommentReply = (
    commentId,
    commentBy,
    responseId,
    content
) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (commentId && commentBy && responseId && content) {
                const checkCommentExist = await db.CommentHistory.findOne({
                    where: { id: commentId },
                });

                if (checkCommentExist) {
                    await db.CommentReply.create({
                        commentId,
                        commentBy,
                        responseId,
                        content,
                    });

                    resolve({
                        errCode: 0,
                        message: "Reply succeed",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Comment not exist",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required paramters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getUsersLikedPost = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const LikeHistories = await db.LikeHistory.findAll({
                    where: {
                        postId,
                    },
                });

                if (LikeHistories && LikeHistories.length > 0) {
                    const output = await Promise.all(
                        LikeHistories.map(async (likeHistory) => {
                            const user = await db.User.findOne({
                                where: {
                                    id: likeHistory.likeBy,
                                },
                            });

                            return user;
                        })
                    );

                    resolve(output);
                } else {
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeleteLikeHistories = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                await db.LikeHistory.destroy({
                    where: {
                        postId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Delete like histories succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeleteCommentHistories = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                await db.CommentHistory.destroy({
                    where: {
                        postId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Delete comment histories succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeletePhotos = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                await db.Photo.destroy({
                    where: {
                        postId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Delete photos histories succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeleteCommentById = (commentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (commentId) {
                await db.CommentHistory.destroy({
                    where: {
                        id: commentId,
                    },
                });

                await db.CommentReply.destroy({
                    where: {
                        commentId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Deleted comment succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeleteCommentReplyById = (commentReplyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (commentReplyId) {
                await db.CommentReply.destroy({
                    where: { id: commentReplyId },
                });

                resolve({
                    errCode: 0,
                    message: "Deleted comment reply succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleUpdateLikeCount = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId) {
                const likeCount = await db.LikeHistory.count({
                    where: {
                        postId,
                    },
                });

                await db.Post.update(
                    {
                        likeCount,
                    },
                    {
                        where: {
                            id: postId,
                        },
                    }
                );

                resolve({
                    errCode: 0,
                    message: "Update like count succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const handleDeletePhotoById = (photoId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (photoId) {
                await db.Photo.destroy({
                    where: {
                        id: photoId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Deleted photo succeed",
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required paramter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getLikeCountOfUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const allPostsOfUser = await db.Post.findAll({
                    where: {
                        userId,
                    },
                });

                const postIdArr = allPostsOfUser.map((post) => post.id);

                const likeCountArr = await Promise.all(
                    postIdArr.map(async (postId) => {
                        const count = await db.LikeHistory.count({
                            where: {
                                postId,
                            },
                        });

                        return count;
                    }, 0)
                );

                const output = likeCountArr.reduce((acc, like) => {
                    return acc + like;
                }, 0);

                resolve({
                    errCode: 0,
                    message: "Get like count of user succeed",
                    data: output,
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getQuantityPostOfUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const quantityPost = await db.Post.count({
                    where: {
                        userId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Get quantity post of user succeed",
                    data: quantityPost,
                });
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const checkPostSaved = (postId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId && userId) {
                const count = await db.SavedPost.count({
                    where: { postId, userId },
                });

                if (count > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const savePost = (postId, userId, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId && userId) {
                const isExist = await checkPostSaved(postId, userId);

                if (!isExist) {
                    await db.SavedPost.create({ postId, userId, status });

                    resolve({
                        errCode: 1,
                        message: "Saved post",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Post have been saved",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const unSavePost = (postId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (postId && userId) {
                const isExist = await checkPostSaved(postId, userId);

                if (isExist) {
                    await db.SavedPost.destroy({ where: { postId, userId } });

                    resolve({
                        errCode: 1,
                        message: "Un saved post succeed",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Post not save",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getSavedList = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const savedPostIds = await db.SavedPost.findAll({
                    attributes: ["postId"],
                    where: {
                        userId,
                        status: "resolve",
                    },
                    order: [["id", "DESC"]],
                });

                if (savedPostIds && savedPostIds.length > 0) {
                    const idArr = savedPostIds.map((item) => item.postId);

                    const output = await Promise.all(
                        idArr.map(async (id) => {
                            const post = await getPostById(id);
                            return post;
                        })
                    );

                    resolve({
                        errCode: 0,
                        message: "Get list post saved succeed",
                        data: output,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: `Don't have any post saved`,
                        data: [],
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    create,
    getPostById,
    getListPosts,
    handleDelete,
    handleLike,
    getLikedPostsIdOfUser,
    handleUnlike,
    handleCreateComment,
    handleCreateCommentReply,
    getComments,
    handleDeleteLikeHistories,
    handleDeleteCommentHistories,
    handleDeletePhotos,
    handleDeleteCommentById,
    handleDeleteCommentReplyById,
    handleUpdateLikeCount,
    update,
    handleDeletePhotoById,
    getLikeCountOfUser,
    getQuantityPostOfUser,
    savePost,
    unSavePost,
    getSavedList,
    checkPostSaved,
};
