const bcrypt = require("bcrypt");
const errorCodes = require("./errorCodes");
const errorMessages = require("./errorMsgs");
module.exports = {
	//errorHandler: require("./errorHandler"),
	genHash: function (data) {
		let salt = bcrypt.genSaltSync(8);
		return bcrypt.hashSync(data, salt);
	},
	//verifyToken: require("./verifyToken"),
	hasRole: function (role) {
		return function (req, res, next) {
			if (role !== req.user.role) {
				return res
					.status(errorCodes.HTTP_UNAUTHORIZED)
					.json({ errMessage: errorMessages[errorCodes.HTTP_UNAUTHORIZED] });
			} else next();
		};
	},
	err: (msg, code) => {
		let err = new Error(msg)
		err.status = code;
		return err
	},
	success: (req, res, status, data) => {
		req.appLogger.info(
			`IP - ${req.ip} | URL : ${req.protocol}://${req.get("host")}${req.originalUrl
			} | Request : ${JSON.stringify(
				req.body ? req.body : {}
			)} | Response :  ${JSON.stringify(data)}`
		);
		res.status(status).json(data)
	}
};
