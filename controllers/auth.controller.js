const jwt = require('jsonwebtoken'),
    { userService } = require('../services'),
    message = require('../utils/errorMsgs'),
    { UserRole, signUp } = require('../constants');

const { Op } = require("sequelize");


module.exports = {
    verifyAuth: (req, res, next) => {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization'];
            if (token) {
                if (token.startsWith('Bearer ')) {
                    token = token.slice(7, token.length);
                }
                return jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
                    if (error) {
                        let e = new Error("Unauthorized")
                        e.status = 401
                        return next(e);
                    } else {
                        req.user = payload;
                        next();
                    }
                });
            }
        } catch (e) {
            return next(e);
        }
    },
    verifyUserAuth: (req, res, next) => {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization'];
            if (token) {
                if (token.startsWith('Bearer ')) {
                    token = token.slice(7, token.length);
                }
                return jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
                    if (error) {
                        let e = new Error("Unauthorized")
                        e.status = 401
                        return next(e);
                    } else {
                            const { userId,key } = payload;
                            let user = await userService.findUser({ userId, signUpStatus:{
                                [Op.in]:[signUp.ACTIVE,signUp.SUSPEND]
                            } }, true);
                            if (user) {
                                if(user.dataValues.statusBasedKey == key){

                                    if(user.dataValues.typeId == UserRole.END_USER){
                                        req.user = user;
                                        next();
                                    }else{
                                        let err = new Error(message.notHaveAdminPrivilage)
                                        err.status = 401;
                                        next(err)
                                    }
                                }else{
                                    let err = new Error("Unauthorized")
                                err.status = 401;
                                next(err)
                                }
                            } else {
                                let err = new Error("Unauthorized")
                                err.status = 401;
                                next(err)
                            }
                    }
                });
            }
        } catch (e) {
            return next(e);
        }
    },
    verifyAdminAuth: (req, res, next) => {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization'];
            if (token) {
                if (token.startsWith('Bearer ')) {
                    token = token.slice(7, token.length);
                }
                return jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
                    if (error) {
                        let e = new Error("Unauthorized")
                        e.status = 401
                        return next(e);
                    } else {
                        const { userId } = payload;
                        let user = await userService.findUser({ userId, signUpStatus: signUp.ACTIVE}, true);

                        if (user) {
                            if(user.dataValues.typeId == UserRole.ADMIN_R){
                                req.user = user;
                                next();
                            }else{
                                let err = new Error(message.notHaveAdminPrivilage)
                                err.status = 401;
                                next(err)
                            }

                        } else {
                            let err = new Error("Unauthorized")
                            err.status = 401;
                            next(err)
                        }
                    }
                });
            }
        } catch (e) {
            return next(e);
        }
    },
    verifyInterServiceAuth: (req, res, next) => {
        try {
            let inertServiceKey = req.headers['interserviceauthentication'];
            if (inertServiceKey) {
                let tokenValidation = (req.headers['interserviceauthentication'] == process.env.INTER_SERVICE_SECRET_KEY)
                    if (!tokenValidation) {
                        let e = new Error("Unauthorized")
                        e.status = 401
                        return next(e);
                    } else {
                        next();
                    }
            }else{
                let err = new Error("Unauthorized")
                err.status = 401
                return next(err);
            }
        } catch (e) {
            return next(e);
        }
    },
    verifyUserAuthOrWithout: async (req, res, next) => {
        try {
            if (req.headers.authorization)
                return await module.exports.verifyUserAuth(req, res, next)
            next()
        } catch (e) {
            return next(e);
        }
    },
    logout: (req, res, next) => {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization'];
            if (token) {
                if (token.startsWith('Bearer ')) {
                    token = token.slice(7, token.length);
                }

                if(req.headers['authorization']) {
                    try {
                        delete req.headers['authorization']
                    } catch (error) {
                        return next(error)                        
                    }
                }
                next();
            }
        } catch (e) {
            return next(e);
        }
    },
}