import * as userServices from "../services/userServices";

// REGISTER
const register = async (req, res) => {
    const data = req.body;
    const response = await userServices.register(data);
    return res.status(200).json(response);
};

// LOGIN
const login = async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const response = await userServices.login(username, password);
    return res.status(200).json(response);
};

// UPDATE
const update = async (req, res) => {
    const data = req.body;
    const response = await userServices.update(data);
    return res.status(200).json(response);
};

// DELETE
const destroy = async (req, res) => {
    const userId = req.body.userId;
    const response = await userServices.destroy(userId);
    return res.status(200).json(response);
};

// SEARCH
const search = async (req, res) => {
    const keyword = req.query.keyword;
    const response = await userServices.search(keyword);
    return res.status(200).json(response);
};

// GET USER
const getUser = async (req, res) => {
    const userId = req.query.userId;
    const response = await userServices.getUser(userId);
    return res.status(200).json(response);
};

// GET LIST USER
const getUsers = async (req, res) => {
    const userLoggedInId = req.query.userLoggedInId;
    const page = req.query.page;
    const response = await userServices.getUsers(userLoggedInId, page);
    return res.status(200).json(response);
};

module.exports = {
    login,
    register,
    getUser,
    update,
    destroy,
    search,
    getUsers,
};
