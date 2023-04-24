import db, { sequelize } from "../models";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import _ from "lodash";

const salt = bcrypt.genSaltSync(10);

// HASH PASSWORD
const hashUserPassword = (userPassword) => {
    return new Promise((resolve, reject) => {
        try {
            const hashPassword = bcrypt.hashSync(userPassword, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};

// CHECK USERNAME EXIST
const checkUsernameExist = (username) => {
    return new Promise(async (resolve, reject) => {
        try {
            const usernameCount = await db.User.count({ where: { username } });
            if (usernameCount > 0) resolve(true);
            else resolve(false);
        } catch (e) {
            reject(e);
        }
    });
};

// REGISTER
const register = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data) {
                if (
                    data.username &&
                    data.firstName &&
                    data.lastName &&
                    data.password &&
                    data.passwordConfirm
                ) {
                    const usernameExist = await checkUsernameExist(
                        data.username
                    );

                    if (!usernameExist) {
                        if (data.password === data.passwordConfirm) {
                            const hashPassword = await hashUserPassword(
                                data.password
                            );

                            await db.User.create({
                                firstName: data.firstName,
                                lastName: data.lastName,
                                tick: data.tick,
                                username: data.username,
                                roleId: data.roleId,
                                password: hashPassword,
                            });

                            resolve({
                                errCode: 0,
                                message: "Tạo tài khoản thành công",
                            });
                        } else {
                            resolve({
                                errCode: 1,
                                message: "Nhập lại mật khẩu không chính xác",
                            });
                        }
                    } else {
                        resolve({
                            errCode: 1,
                            message: "Tài khoản đã tồn tại trên hệ thống",
                        });
                    }
                } else {
                    resolve({
                        errCode: 1,
                        message: "Chưa nhập đầy đủ thông tin",
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Không có dữ liệu",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

// LOGIN
const login = (username, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (username && password) {
                const usernameExist = await checkUsernameExist(username);

                if (usernameExist) {
                    const user = await db.User.findOne({
                        where: {
                            username,
                        },
                    });

                    if (!_.isEmpty(user)) {
                        const checkPassword = bcrypt.compareSync(
                            password,
                            user.password
                        );

                        if (checkPassword) {
                            const userLoggedIn = await getUser(user.id);
                            delete userLoggedIn.password;

                            if (!_.isEmpty(userLoggedIn.data)) {
                                resolve({
                                    errCode: 0,
                                    message: "Đăng nhập thành công",
                                    data: userLoggedIn.data,
                                });
                            }
                        } else {
                            resolve({
                                errCode: 1,
                                message: "Sai mật khẩu",
                            });
                        }
                    } else {
                        resolve({
                            errCode: 1,
                            message: `Người dùng không tồn tại`,
                        });
                    }
                } else {
                    resolve({
                        errCode: 1,
                        message: `Tên đăng nhập không tồn tại trên hệ thống`,
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: "Các trường bắt buộc không được để trống",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

// UPDATE
const update = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data) {
                const emailExist = checkUsernameExist(data.email);

                if (emailExist) {
                    if (typeof data.avatar !== "object") {
                        await db.User.update(
                            {
                                firstName: data.firstName,
                                lastName: data.lastName,
                                avatar: data.avatar,
                            },
                            {
                                where: {
                                    id: data.userId,
                                },
                            }
                        );
                    } else {
                        await db.User.update(
                            {
                                firstName: data.firstName,
                                lastName: data.lastName,
                            },
                            {
                                where: {
                                    id: data.userId,
                                },
                            }
                        );
                    }

                    const user = await db.User.findOne({
                        where: {
                            id: data.userId,
                        },
                    });
                    delete user.password;

                    resolve({
                        errCode: 0,
                        message: "Update succeed",
                        data: user,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: `Email don't exist in our system`,
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

// DELETE
const destroy = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const user = await db.User.findOne({
                    where: {
                        id: userId,
                    },
                });

                if (user) {
                    await db.User.destroy({
                        where: {
                            id: userId,
                        },
                    });

                    resolve({
                        errCode: 0,
                        message: "Delete user success",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "User not found",
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

// SEARCH
const search = (keyword) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (keyword && keyword.trim()) {
                const results = await db.User.findAll({
                    where: {
                        [Op.or]: [
                            {
                                firstName: {
                                    [Op.like]: `%${keyword}%`,
                                },
                            },
                            {
                                lastName: {
                                    [Op.like]: `%${keyword}%`,
                                },
                            },
                        ],
                    },
                });

                if (results && results.length > 0) {
                    resolve({
                        errCode: 0,
                        messsage: "Search succeed",
                        count: results.length,
                        data: results,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Search not found",
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

// GET USER
const getUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const user = await db.User.findOne({ where: { id: userId } });

                if (!_.isEmpty(user)) {
                    delete user.password;

                    const postCount = await getPostCount(userId);
                    const likeCount = await getLikeCount(userId);
                    const likedPosts = await getLikedPosts(userId);
                    const savedPosts = await getSavedPosts(userId);

                    user.postCount = postCount;
                    user.likeCount = likeCount;
                    user.likedPosts = likedPosts;
                    user.savedPosts = savedPosts;

                    resolve({
                        errCode: 0,
                        message: "Get user success",
                        data: user,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "User not found",
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

// GET LIKE COUNT
const getLikeCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const postsOfUser = await db.Post.findAll({
                    where: { userId },
                });

                const idArr = postsOfUser.map((post) => post.id);
                const likeCountArr = await Promise.all(
                    idArr.map(async (id) => {
                        const count = await db.LikeHistory.count({
                            where: { postId: id },
                        });

                        return count;
                    })
                );

                const likeCount = likeCountArr.reduce((acc, like) => {
                    return acc + like;
                }, 0);

                resolve(likeCount);
            } else {
                resolve(0);
            }
        } catch (e) {
            reject(e);
        }
    });
};

// GET POST COUNT
const getPostCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const postCount = await db.Post.count({
                    where: { userId },
                });

                resolve(postCount);
            } else {
                resolve(0);
            }
        } catch (e) {
            reject(e);
        }
    });
};

// GET LIKED POSTS
const getLikedPosts = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const likedPosts = await db.LikeHistory.findAll({
                    attributes: ["postId"],
                    where: { likeBy: userId },
                });

                if (likedPosts && likedPosts.length > 0) {
                    const output = likedPosts.map((like) => like.postId);
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

// GET SAVED POSTS
const getSavedPosts = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userId) {
                const savedPosts = await db.SavedPost.findAll({
                    attributes: ["postId"],
                    where: { userId: userId, status: "resolve" },
                });

                if (savedPosts && savedPosts.length > 0) {
                    const savedPostsId = savedPosts.map((post) => post.postId);
                    resolve(savedPostsId);
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

// GET LIST USER
const getUsers = (userLoggedInId, page) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userLoggedInId && page) {
                const limit = 2;
                const offset = (page - 1) * limit;

                const users = await db.User.findAll({
                    where: {
                        id: {
                            [Op.ne]: userLoggedInId,
                        },
                    },
                    offset: offset,
                    limit: limit,
                    order: [["id", "DESC"]],
                });

                users.forEach((user) => {
                    delete user.password;
                });

                if (users && users.length > 0) {
                    resolve({
                        errCode: 0,
                        message: "Get list user succeed",
                        data: users,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "No have users",
                        data: [],
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

module.exports = {
    login,
    register,
    getUser,
    update,
    destroy,
    search,
    getUsers,
};
