import express from "express";

import userController from "../controllers/userController";
import postController from "../controllers/postController";
import chatController from "../controllers/chatController";

const router = express.Router();

const initWebRoutes = (app) => {
    // User
    router.post("/api/user/register", userController.register);
    router.get("/api/user/login", userController.login);
    router.get("/api/user/get-user", userController.getUser);
    router.put("/api/user/update", userController.update);
    router.get("/api/user/search", userController.search);
    router.get("/api/user/get-users", userController.getUsers);

    // Post
    router.post("/api/post/create", postController.create);
    router.get("/api/post/get-post-by-id", postController.getPostById);
    router.get("/api/post/get-list-posts", postController.getListPosts);
    router.delete("/api/post/delete", postController.handleDelete);
    router.put("/api/post/update", postController.update);

    router.post("/api/post/like", postController.handleLike);
    router.get("/api/post/liked-posts-id", postController.getLikedPostsId);
    router.post("/api/post/unlike", postController.handleUnlike);

    router.post("/api/post/create-comment", postController.handleCreateComment);
    router.post(
        "/api/post/create-comment-reply",
        postController.handleCreateCommentReply
    );
    router.get("/api/post/get-comments", postController.getCommentsByPostId);

    router.get("/api/post/get-users-liked", postController.getUsersLikedPost);

    router.delete(
        "/api/post/delete-like-histories",
        postController.handleDeleteLikeHistories
    );
    router.delete(
        "/api/post/delete-comment-histories",
        postController.handleDeleteCommentHistories
    );
    router.delete("/api/post/delete-photos", postController.handleDeletePhotos);
    router.delete(
        "/api/post/delete-comment-by-id",
        postController.handleDeleteCommentById
    );
    router.delete(
        "/api/post/delete-comment-reply-by-id",
        postController.handleDeleteCommentReplyById
    );
    router.delete(
        "/api/post/delete-photo-by-id",
        postController.handleDeletePhotoById
    );

    router.put(
        "/api/post/update-like-count",
        postController.handleUpdateLikeCount
    );

    router.get(
        "/api/post/get-like-count-of-user",
        postController.getLikeCountOfUser
    );

    router.get(
        "/api/post/get-quantity-post-of-user",
        postController.getQuantityPostOfUser
    );

    router.post("/api/post/save", postController.savePost);
    router.delete("/api/post/un-save", postController.unSavePost);
    router.get("/api/post/saved-list", postController.getSavedList);
    router.get("/api/post/check-saved", postController.checkPostSaved);

    // Chat
    router.get("/api/chat/get-chat-room", chatController.getChatRoom);
    router.post("/api/chat/create-room", chatController.createChatRoom);
    router.post("/api/chat/create-message", chatController.createMessage);
    router.get("/api/chat/get-message-list", chatController.getMessageList);
    router.get("/api/chat/get-list-room-chat", chatController.getListRoomChat);
    router.get(
        "/api/chat/get-quantity-unread",
        chatController.getQuantityUnread
    );
    router.put("/api/chat/seen-message", chatController.seenMessage);

    return app.use("/", router);
};

module.exports = initWebRoutes;
