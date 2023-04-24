import db from "../models";

const getAllProvinces = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await db.Province.findAll({
                order: [["name", "ASC"]],
            });

            resolve(res);
        } catch (e) {
            reject(e);
        }
    });
};

const getOneProvince = (provinceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!provinceId) {
                resolve({
                    errCode: 1,
                    message: "Missing required input parameters",
                });
            } else {
                const res = await db.Province.findOne({
                    where: {
                        id: provinceId,
                    },
                });

                if (!res) {
                    resolve({
                        errCode: 1,
                        message: "Not found",
                    });
                } else {
                    resolve({
                        errCode: 0,
                        message: "OK",
                        data: res,
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getListDistricts = (provinceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!provinceId) {
                resolve({
                    errCode: 1,
                    message: "Missing required parameter",
                });
            } else {
                const res = await db.District.findAll({
                    where: {
                        provinceId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "OK",
                    data: res,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getListWards = (provinceId, districtId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!provinceId && !districtId) {
                resolve({
                    errCode: 1,
                    message: "Missing required parameters",
                });
            } else {
                const res = await db.Ward.findAll({
                    where: {
                        provinceId,
                        districtId,
                    },
                });

                resolve({
                    errCode: 0,
                    message: "OK",
                    data: res,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getProvinceById = (provinceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (provinceId) {
                const province = await db.Province.findOne({
                    where: {
                        id: provinceId,
                    },
                });

                if (province) {
                    resolve({
                        errCode: 0,
                        message: "Get province success",
                        data: province,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Province not found",
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

const getDistrictById = (districtId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (districtId) {
                const district = await db.District.findOne({
                    where: {
                        id: districtId,
                    },
                });

                if (district) {
                    resolve({
                        errCode: 0,
                        message: "Get district success",
                        data: district,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "District not found",
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

const getWardById = (wardId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (wardId) {
                const ward = await db.Ward.findOne({
                    where: {
                        id: wardId,
                    },
                });

                if (ward) {
                    resolve({
                        errCode: 0,
                        message: "Get ward success",
                        data: ward,
                    });
                } else {
                    resolve({
                        errCode: 1,
                        message: "Ward not found",
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
    getAllProvinces,
    getOneProvince,
    getListDistricts,
    getListWards,
    getProvinceById,
    getDistrictById,
    getWardById,
};
