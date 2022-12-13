const jwt = require("jsonwebtoken");
const errorCodes = require("../configs/errorCodes");
const errorMessages = require("../configs/errorMsgs");
let verifyToken = async (req, res, next) => {
	let token = req.headers["x-access-token"] || req.headers["token"];
	if (token) {
		token = token.replace("Bearer ", "");
		return jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
			if (err) {
				return res
					.status(errorCodes.HTTP_UNAUTHORIZED)
					.json({ errMessage: errorMessages[errorCodes.HTTP_UNAUTHORIZED] });
			} else {
				req.user = {};
				req.user = payload; // payload
				next();
			}
		});
	}
	return res
		.status(errorCodes.HTTP_UNAUTHORIZED)
		.json({ errMessage: errorMessages[errorCodes.HTTP_UNAUTHORIZED] });
};
module.exports = verifyToken;
