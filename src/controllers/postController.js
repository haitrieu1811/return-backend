import postServices from "../services/postServices";

const create = async (req, res) => {
    const data = req.body;
    const response = await postServices.create(data);
    return res.status(200).json(response);
};

const getPostById = async (req, res) => {
    const postId = req.query.postId;
    const response = await postServices.getPostById(postId);
    return res.status(200).json(response);
};

const getListPosts = async (req, res) => {
    const userId = req.query.userId;
    const page = req.query.page;
    const response = await postServices.getListPosts(userId, page);
    return res.status(200).json(response);
};

const handleDelete = async (req, res) => {
    const postId = req.body.postId;
    const response = await postServices.handleDelete(postId);
    return res.status(200).json(response);
};

const handleLike = async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    const response = await postServices.handleLike(userId, postId);
    return res.status(200).json(response);
};

const getLikedPostsId = async (req, res) => {
    const userId = req.query.userId;
    const response = await postServices.getLikedPostsIdOfUser(userId);
    return res.status(200).json(response);
};

const handleUnlike = async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    const response = await postServices.handleUnlike(userId, postId);
    return res.status(200).json(response);
};

const handleCreateComment = async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    const content = req.body.content;
    const response = await postServices.handleCreateComment(
        userId,
        postId,
        content
    );

    return res.status(200).json(response);
};

const handleCreateCommentReply = async (req, res) => {
    const commentId = req.body.commentId;
    const commentBy = req.body.commentBy;
    const responseId = req.body.responseId;
    const content = req.body.content;
    const response = await postServices.handleCreateCommentReply(
        commentId,
        commentBy,
        responseId,
        content
    );

    return res.status(200).json(response);
};

const getCommentsByPostId = async (req, res) => {
    const postId = req.query.postId;
    const response = await postServices.getComments(postId);
    return res.status(200).json(response);
};

const getUsersLikedPost = async (req, res) => {
    const postId = req.query.postId;
    const response = await postServices.getUsersLikedPost(postId);
    return res.status(200).json(response);
};

const handleDeleteLikeHistories = async (req, res) => {
    const postId = req.body.postId;
    const response = await postServices.handleDeleteLikeHistories(postId);
    return res.status(200).json(response);
};

const handleDeleteCommentHistories = async (req, res) => {
    const postId = req.body.postId;
    const response = await postServices.handleDeleteCommentHistories(postId);
    return res.status(200).json(response);
};

const handleDeletePhotos = async (req, res) => {
    const postId = req.body.postId;
    const response = await postServices.handleDeletePhotos(postId);
    return res.status(200).json(response);
};

const handleDeleteCommentById = async (req, res) => {
    const commentId = req.body.commentId;
    const response = await postServices.handleDeleteCommentById(commentId);
    return res.status(200).json(response);
};

const handleDeleteCommentReplyById = async (req, res) => {
    const commentReplyId = req.body.commentReplyId;
    const response = await postServices.handleDeleteCommentReplyById(
        commentReplyId
    );
    return res.status(200).json(response);
};

const handleUpdateLikeCount = async (req, res) => {
    const postId = req.body.postId;
    const response = await postServices.handleUpdateLikeCount(postId);
    return res.status(200).json(response);
};

const update = async (req, res) => {
    const data = req.body.data;
    const postId = req.body.postId;
    const response = await postServices.update(data, postId);
    return res.status(200).json(response);
};

const handleDeletePhotoById = async (req, res) => {
    const photoId = req.body.photoId;
    const response = await postServices.handleDeletePhotoById(photoId);
    return res.status(200).json(response);
};

const getLikeCountOfUser = async (req, res) => {
    const userId = req.query.userId;
    const response = await postServices.getLikeCountOfUser(userId);
    return res.status(200).json(response);
};

const getQuantityPostOfUser = async (req, res) => {
    const userId = req.query.userId;
    const response = await postServices.getQuantityPostOfUser(userId);
    return res.status(200).json(response);
};

const savePost = async (req, res) => {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const status = req.body.status;
    const response = await postServices.savePost(postId, userId, status);
    return res.status(200).json(response);
};

const unSavePost = async (req, res) => {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const response = await postServices.unSavePost(postId, userId);
    return res.status(200).json(response);
};

const getSavedList = async (req, res) => {
    const userId = req.query.userId;
    const response = await postServices.getSavedList(userId);
    return res.status(200).json(response);
};

const checkPostSaved = async (req, res) => {
    const postId = req.query.postId;
    const userId = req.query.userId;
    const response = await postServices.checkPostSaved(postId, userId);
    return res.status(200).json(response);
};

module.exports = {
    create,
    getPostById,
    handleDelete,
    handleLike,
    getLikedPostsId,
    handleUnlike,
    handleCreateComment,
    handleCreateCommentReply,
    getCommentsByPostId,
    getListPosts,
    getUsersLikedPost,
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
