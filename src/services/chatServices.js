import db from "../models";

const { Op } = require("sequelize");

const checkChatRoomExist = (firstUserId, secondUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (firstUserId && secondUserId) {
                const firstCheck = await db.ChatRoom.count({
                    where: {
                        [Op.or]: [
                            {
                                firstUser: firstUserId,
                                secondUser: secondUserId,
                            },
                            {
                                firstUser: secondUserId,
                                secondUser: firstUserId,
                            },
                        ],
                    },
                });

                if (firstCheck > 0) {
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

const createChatRoom = (firstUserId, secondUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (firstUserId && secondUserId) {
                const chatRoomExist = await checkChatRoomExist(
                    firstUserId,
                    secondUserId
                );

                if (!chatRoomExist) {
                    await db.ChatRoom.create({
                        firstUser: firstUserId,
                        secondUser: secondUserId,
                    });

                    resolve({
                        errCode: 0,
                        message: "Create chat room succeed",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Chat room already exist",
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

const getChatRoom = (firstUserId, secondUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (firstUserId && secondUserId) {
                const checkRoomExist = await checkChatRoomExist(
                    firstUserId,
                    secondUserId
                );

                if (checkRoomExist) {
                    const chatRoomId = await db.ChatRoom.findOne({
                        where: {
                            [Op.or]: [
                                {
                                    firstUser: firstUserId,
                                    secondUser: secondUserId,
                                },
                                {
                                    firstUser: secondUserId,
                                    secondUser: firstUserId,
                                },
                            ],
                        },
                    });

                    resolve({
                        errCode: 0,
                        message: "Get chat room succeed",
                        data: chatRoomId,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Chat room not exist",
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

const createMessage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                data.content &&
                data.senderId &&
                data.receiverId &&
                data.chatRoomId &&
                data.status
            ) {
                await db.Message.create({
                    content: data.content,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    chatRoomId: data.chatRoomId,
                    status: data.status,
                });

                resolve({
                    errCode: 0,
                    message: "Created chat room succeed",
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

const getMessageList = (chatRoomId, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (chatRoomId) {
                let messageList = [];
                if (page) {
                    const messagePerPage = 10;
                    const offset = (page - 1) * messagePerPage;

                    messageList = await db.Message.findAll({
                        where: {
                            chatRoomId,
                        },
                        offset,
                        limit: messagePerPage,
                    });
                } else {
                    messageList = await db.Message.findAll({
                        where: {
                            chatRoomId,
                        },
                    });
                }

                if (messageList && messageList.length > 0) {
                    resolve({
                        errCode: 0,
                        message: "Get message list succeed",
                        data: messageList,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "No message yet",
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

const getListRoomChat = (userId, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                let listRoom = [];

                if (page) {
                    const itemPerPage = 3;
                    const offset = (page - 1) * itemPerPage;

                    listRoom = await db.ChatRoom.findAll({
                        where: {
                            [Op.or]: [
                                {
                                    firstUser: userId,
                                },
                                {
                                    secondUser: userId,
                                },
                            ],
                        },
                        offset: offset,
                        limit: itemPerPage,
                        order: [["updatedAt", "DESC"]],
                    });
                } else {
                    listRoom = await db.ChatRoom.findAll({
                        where: {
                            [Op.or]: [
                                {
                                    firstUser: userId,
                                },
                                {
                                    secondUser: userId,
                                },
                            ],
                        },
                        order: [["updatedAt", "DESC"]],
                    });
                }

                if (listRoom && listRoom.length > 0) {
                    resolve({
                        errCode: 0,
                        message: "Get list chat room succeed",
                        data: listRoom,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "No chat room exist",
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

const getQuantityUnread = (chatRooomId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (chatRooomId && userId) {
                const unreadCount = await db.Message.count({
                    where: {
                        chatRoomId: chatRooomId,
                        receiverId: userId,
                        status: "sent",
                    },
                });

                resolve({
                    errCode: 0,
                    message: "Get quantity unread message succeed",
                    data: unreadCount,
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

const seenMessage = (chatRoomId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (chatRoomId && userId) {
                await db.Message.update(
                    {
                        status: "seen",
                    },
                    {
                        where: {
                            chatRoomId: chatRoomId,
                            receiverId: userId,
                        },
                    }
                );

                resolve({
                    errCode: 0,
                    message: "Updated message status succeed",
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

module.exports = {
    checkChatRoomExist,
    createChatRoom,
    getChatRoom,
    createMessage,
    getMessageList,
    getListRoomChat,
    getQuantityUnread,
    seenMessage,
};
