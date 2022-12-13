const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { uuid } = require('uuidv4');
const { object } = require('joi');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_KEY, // ,
    accessKeyId: process.env.AWS_ACCESS_KEY, // process.env.ACCESS_KEY,
    region: process.env.AWS_REGION, // process.env.REGION
})

let storage = multer.diskStorage({ // local Storage
    destination: (req, file, cb) => {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const s3 = new aws.S3()
if (process.env.NODE_ENV === "development" && process.env.AWS_SECRET_KEY) {

    storage = multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        // acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            file.fieldname.split(/\[(.*?)\]/)
                .filter((item) => item ? item : null)[0]
            let folder = "uploads";
            cb(null, `${folder}/${uuid().split('-').join('') + path.extname(file.originalname)}`);
        },

    })
}

const filter = (req, res, file, cb) => {
    const formats = ['.png', '.jpg', '.jpeg', '.svg','.pdf']
    console.log(formats.includes(path.extname(file.originalname).toLowerCase()));
    if (formats.includes(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        cb(null, false);
        if (!req.files.errors) {
            req.files.errors = [];
        }
        req.files.errors.push({
            file,
            reason: "Invalid file type."
        });
    }
};

function validateFile(req, res, next) {
    req.files = {}
    return new Promise((resolve, reject) => {

        multer({
            storage: storage,
            fileFilter: (reqe, file, cb) => filter(reqe, res, file, cb),
            limits: { fileSize: 10000000 },
        }).any()(req, res, (err) => {
            if (err && err.message) {
                err.status = 400;
                reject(next(err));
            }
            else {
               
                let files = req.files;
                if (files && (files.length || typeof files === 'object')) {
                    let details = [];
                    if (files.errors) {
                        req.files.errors.forEach((error) => {
                            let file = error.file;
                            details.push({
                                path: [file.fieldname],
                                message: error.reason
                            })
                        });

                        const data = details.reduce((prev, curr) => {
                            prev[curr.path[0]] = curr.message.replace(/"/g, "");
                            return prev;
                        }, {});
                        let msg = Object.values(data).length ? Object.values(data).join(', ') : "bad request";
                        let errorData = new Error(msg)
                        errorData.status = 400
                        reject(next(errorData));
                    }

                    if (Array.isArray(files)) {
                        console.log(files);
                        files.forEach((file) => {
                            let holder = req.body;
                            
                            let filePath = file.fieldname.split(/\[(.*?)\]/)
                            .filter((item) => item ? item : null);
                            console.log("🚀 ~ file: multer.js ~ line 101 ~ files.forEach ~ filePath", filePath)
                            filePath.forEach((item, index) => {
                                console.log(index + 1 === filePath.length)
                                if (index + 1 === filePath.length) {
                                    if (process.env.NODE_ENV === "development") holder[item] = file.key
                                    else holder[item] = `${process.env.PUBLIC_UPLOAD_LINK}${file.destination.replace('.', '')}${file.filename}`;
                                } else {
                                    if (!holder[item]) {
                                        holder[item] = {};
                                    }
                                    holder = holder[item];
                                }
                            });
                        });
                    }
                    if (Object.entries(files).length) resolve(true);
                    else resolve(false)
                }
            }
        });
    })

}

const getSingedUrl = async (fileName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName, // File name you want to save as in S3
        Expires: 60*60*24 //one hr
    };
    try {
        const urlData = await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject',params, (err, url) => {
                err ? reject(err) : resolve(url);
            });
        });
        return urlData;
    } catch (err) {
        if (err) {
        console.log(err)
        }
    }
}


module.exports = {
    validateFile: validateFile,
    getSingedUrl:getSingedUrl
};