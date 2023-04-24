import chatServices from "../services/chatServices";

const createChatRoom = async (req, res) => {
    const firstUserId = req.body.firstUserId;
    const secondUserId = req.body.secondUserId;
    const response = await chatServices.createChatRoom(
        firstUserId,
        secondUserId
    );
    return res.status(200).json(response);
};

const getChatRoom = async (req, res) => {
    const firstUserId = req.query.firstUserId;
    const secondUserId = req.query.secondUserId;
    const response = await chatServices.getChatRoom(firstUserId, secondUserId);
    return res.status(200).json(response);
};

const createMessage = async (req, res) => {
    const data = req.body.data;
    const response = await chatServices.createMessage(data);
    return res.status(200).json(response);
};

const getMessageList = async (req, res) => {
    const chatRoomId = req.query.chatRoomId;
    const page = req.query.page;
    const response = await chatServices.getMessageList(chatRoomId, page);
    return res.status(200).json(response);
};

const getListRoomChat = async (req, res) => {
    const userId = req.query.userId;
    const page = req.query.page;
    const response = await chatServices.getListRoomChat(userId, page);
    return res.status(200).json(response);
};

const getQuantityUnread = async (req, res) => {
    const chatRoomId = req.query.chatRoomId;
    const userId = req.query.userId;
    const response = await chatServices.getQuantityUnread(chatRoomId, userId);
    return res.status(200).json(response);
};

const seenMessage = async (req, res) => {
    const chatRoomId = req.body.chatRoomId;
    const userId = req.body.userId;
    const response = await chatServices.seenMessage(chatRoomId, userId);
    return res.status(200).json(response);
};

module.exports = {
    createChatRoom,
    getChatRoom,
    createMessage,
    getMessageList,
    getListRoomChat,
    getQuantityUnread,
    seenMessage,
};
