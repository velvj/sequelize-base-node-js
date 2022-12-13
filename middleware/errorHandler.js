const { message, status } = require('../configs');

// error handler middleware
module.exports = (err, req, res, next) => {
	const code = err.status ? err.status : 500;
	if (err.message === 'Validation error') {
		err.message = message.exist;
		err.status = 400;
	}
	if (code) {
		if(status.HTTP_UNPROCESSABLE_ENTITY) {
			let error = err.details && err.details.reduce((prev, curr) => {
				prev[curr.path[0]] = curr.message.replace(/"/g, "");
				return prev;
			}, {}) || err;
			let msg = Array.isArray(error) ? (Object.values(error).length ? Object.values(error).join(', ') : message[400]) : err.message;
			err.message = msg
			crateLogs(req, err)
			return res.status(code).json({
				status: code,
				message: msg,
				// error
			});
		}else {
			crateLogs(req, err)
			return res.status(err.status || 500).json({
				status: err.status || 500,
				message: err.message || 'Internal Server Error',
			});
		}
	}

	function crateLogs(request, error) {
		request.appLogger.error(
			`IP - ${request.ip} | URL : ${request.protocol}://${request.get("host")}${
			request.originalUrl
			} | ${request.method} | Request : ${JSON.stringify(
				request.body ? request.body : {}
			)} | Error : ${error.message}`
		);
	}
};