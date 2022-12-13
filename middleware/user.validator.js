const Joi = require('joi')
const { HTTP_UNPROCESSABLE_ENTITY } = require('../utils/errorCodes')
const { validateFile } = require('../middleware/multer')
const {  UserStatus, SORTBY } = require('../constants')
const aesCipher = require('../utils/cipher')

// add joi schema
const schemas = {
    signUpUser: Joi.object().keys({
        emailId: Joi.string().email().allow('').error(new Error('Please enter a valid Email ID')),
    }),
    loginUser: Joi.object().keys({
        emailId: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    }),
    forgetPassword: Joi.object().keys({
        emailId: Joi.string().email().required(),
    }),
    resetPassword: Joi.object().keys({
        newPassword: Joi.string().min(8).max(20).required(),
        tempPassword: Joi.string(),
        token: Joi.string().required(),
    }),
    updatePersonalDetail: Joi.object().keys({
        name: Joi.string().max(50).required(),
        sureName: Joi.string().max(50).allow(''),
        country: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required(),
        state: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required(),
        city: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required()
    }),
    uploadImage: Joi.object().keys({
        questionImg: Joi.string().required()
    }),
    uploadCommonFiles: Joi.object().keys({
        commonFile: Joi.string().required()
    }),
    termsImage: Joi.object().keys({
        termsImg: Joi.string().required()
    }),
    policyContent: Joi.object().keys({
        policyContent: Joi.string().required()
    }),
    profileImage: Joi.object().keys({
        profileImg: Joi.string().required()
    }),
    updatePassword: Joi.object().keys({
        password: Joi.string().min(8).max(20).required().messages({
            "string.pattern.base": "Password must match atleast one camelcase, number"
        }),
    }),
    getUsers: Joi.object().keys({
        search: Joi.string(),
        isActive: Joi.number().valid(UserStatus.ACTIVE, UserStatus.INACTIVE),
        orderBy: Joi.string(),
        sortBy: Joi.string().valid(SORTBY.ASC, SORTBY.DESC),
        page: Joi.number(),
        limit: Joi.number()
    }),
    usersByIds: Joi.object().keys({
        userId: Joi.array().required()
    }),
    changePassword: Joi.object().keys({
        newPassword: Joi.string().min(8).max(20).required().messages({
            "string.pattern.base": "Password must match atleast one camelcase, number, symbol"
        }),
    }),
    triggerNotification: Joi.object().keys({
        userId: Joi.number().required(),
        title: Joi.string().required(),
        messages: Joi.string().required(),
        body: Joi.string().required(),
    }),
    adminUserDelete: Joi.object().keys({
        userId: Joi.number().required()
    }),
    editUserHelpTopic: Joi.object().keys({
        topicName: Joi.string().required(),
        tagline: Joi.string().allow(''),
        experience: Joi.string().allow(''),
        topicId: Joi.number().required(),
        keywords: Joi.array().items(Joi.string()).min(1).required()
    }),
    updateUserSocialLink: Joi.object().keys({
        linkDetails: Joi.array().items({
            socialLinkName:Joi.string().required(),
            socialLink:Joi.string().required()
        }).min(1).max(3).required()
    }),
    dragUserHelpTopic: Joi.object().keys({
        topicDetails: Joi.array().items({
            topicId:Joi.number().required(),
            orderValue:Joi.number().required()
        }).min(1).max(15).required()
    }),
    addOpenQuestion: Joi.object().keys({
        headline: Joi.string().required(),
        topicName: Joi.string().required(),
        description: Joi.string().max(500).allow(''),
        image:Joi.string().allow(''),
        showProfileStatus: Joi.boolean().required(),
        keywords: Joi.array().items(Joi.string()).min(1).required()
    }),
    updateOpenQuestion: Joi.object().keys({
        headline: Joi.string().required(),
        topicName: Joi.string().required(),
        description: Joi.string().max(500).allow(''),
        image:Joi.string().allow(''),
        showProfileStatus: Joi.boolean().required(),
        keywords: Joi.array().items(Joi.string()).min(1).required()
    }),

    addFeedback: Joi.object().keys({
        feedbackContent: Joi.string().allow('').required()
    }),

    verifyEmail: Joi.object().keys({
        emailId: Joi.string().email().required().error(new Error('Please enter a valid Email ID')),
        code: Joi.number().required()
    }),
    resendCode: Joi.object().keys({
        emailId: Joi.string().email().required().error(new Error('Please enter a valid Email ID'))
    }),
    waitlistUser: Joi.object().keys({
        firstName : Joi.string().max(50).required(),
        lastName : Joi.string().max(50).allow(''),
        emailId : Joi.string().email().required().error(new Error('Please enter a valid Email ID'))
    }),
    sendemail: Joi.object().keys({
        emailId : Joi.string().email().required().error(new Error('Please enter a valid Email ID'))
    }),
    profileDetails: Joi.object().keys({
        firstName: Joi.string().max(50).required(),
        lastName: Joi.string().max(50).allow(''),
        country: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required(),
        state: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required(),
        city: Joi.string().regex(/[a-zA-Z][a-zA-Z\s]*$/).max(50).required()
    }),
    terms: Joi.object().keys({
        // userId: Joi.number().required(),
        data : Joi.string().required()
    }),
    checkReferralCode: Joi.object().keys({
        referralCode: Joi.number().required()
    }),
    helpCard: Joi.object().keys({
        keywords: Joi.array().items(Joi.string()),
	    experience: Joi.array().items(Joi.string().allow('')).required(),
	    country: Joi.string().allow('').allow(''),
	    state: Joi.string().allow('').allow(''),
	    city: Joi.string().allow('').allow(''),
	    page:Joi.number().allow('')
    }),
    publicprofile: Joi.object().keys({
        image: Joi.string().allow('').required(),
        userBio: Joi.string().allow('').required(),
        socialLinks: Joi.array().items(Joi.object({name: Joi.string().allow('').required(),link: Joi.string().allow('').required() })).allow('').required(),
    }),
    updateProfilePicture: Joi.object().keys({
        commonFile: Joi.string().allow('').required()
    }),
    updateTermsValidation: Joi.object().keys({
        terms: Joi.string().required()
    }),
    updateQuickBio: Joi.object().keys({
        userBio: Joi.string().allow('').required()
    }),
    blockUser: Joi.object().keys({
        blockedUserId: Joi.number().required()
    }),
    unblockUser: Joi.object().keys({
        unblockedUserId: Joi.number().required()
    }),
    report: Joi.object().keys({
        reportUserId: Joi.number().required(),
        reason: Joi.string().allow("").max(2000).required()
    }),
    helpTopic: Joi.array().items(Joi.object({
        topicName: Joi.string().allow("").required(),
        userExperience:Joi.string().allow("").required(),
        tagline:Joi.string().allow("").required(),
        helpKeywords: Joi.array().items(Joi.string().allow("").required())
    }))

};

const options = {
    basic: {
        abortEarly: false,
        convert: true,
        allowUnknown: false,
        stripUnknown: true
    },
    array: {
        abortEarly: false,
        convert: true,
        allowUnknown: true,
        stripUnknown: {
            objects: true
        }
    }
};

const signUpUser = async (req, res, next) => {
    try {
        console.log(req.body)
        let schema = schemas.signUpUser;
        let option = options.basic;

        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const updatePassword = async (req, res, next) => {
    try {
        let schema = schemas.updatePassword;
        let option = options.basic;

        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const loginUser = async (req, res, next) => {
    try {
        let schema = schemas.loginUser;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const existingEmail = async (req, res, next) => {
    try {
        let schema = schemas.forgetPassword;
        let option = options.basic;
        await schema.validateAsync({ ...req.query }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        let schema = schemas.forgetPassword;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const resetPassword = async (req, res, next) => {
    try {
        let schema = schemas.resetPassword;
        let option = options.basic;
        await schema.validateAsync({ ...req.body, token: req.headers.authorization }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const createUpdateUser = (req, res, next) => {
    let schema = schemas.createUpdateUser;
    let option = options.basic;
    schema.validate({
        ...req.body
    }, option).then(() => {
        next();
    }).catch(err => {
        Response.joierrors(req, res, err);
    });
};

const updatePersonalDetail = async (req, res, next) => {
    try {
        let schema = schemas.updatePersonalDetail;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const uploadImage = async (req, res, next) => {
    try {

        let schema = schemas.uploadImage;
        let option = options.basic;
        await validateFile(req, res, next)
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const uploadCommonFiles = async (req, res, next) => {
    try {

        let schema = schemas.uploadCommonFiles;
        let option = options.basic;
        await validateFile(req, res, next)
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const termsImage = async (req, res, next) => {
    try {

        let schema = schemas.termsImage;
        let option = options.basic;
        await validateFile(req, res, next)
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const policyUpload = async (req, res, next) => {
    try {

        let schema = schemas.policyContent;
        let option = options.basic;
        await validateFile(req, res, next)
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const profileImage = async (req, res, next) => {
    try {
        let schema = schemas.profileImage;
        let option = options.basic;
        await validateFile(req, res, next)
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const getUsers = async (req, res, next) => {
    try {
        let schema = schemas.getUsers;
        let option = options.basic;
        await schema.validateAsync({ ...req.query }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const usersByIds = async (req, res, next) => {
    try {
        let schema = schemas.usersByIds;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const editUserHelpTopic = async (req, res, next) => {
    try {
        let schema = schemas.editUserHelpTopic;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const dragUserHelpTopic = async (req, res, next) => {
    try {
        let schema = schemas.dragUserHelpTopic;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const updateUserSocialLink = async (req, res, next) => {
    try {
        let schema = schemas.updateUserSocialLink;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const addOpenQuestion = async (req, res, next) => {
    try {
        let schema = schemas.addOpenQuestion;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const updateOpenQuestion = async (req, res, next) => {
    try {
        let schema = schemas.updateOpenQuestion;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const changePassword = async (req, res, next) => {
    try {
        let schema = schemas.changePassword;
        let option = options.basic;

        if (req.body.password) {
            req.body.password = aesCipher.aesDecrpt(req.body.password)
            req.body.newPassword = aesCipher.aesDecrpt(req.body.newPassword)
        }
        await schema.validateAsync({ ...req.body }, option);
        next()
    }
    catch (err) {
        if (err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const adminUserDelete = async (req, res, next) => {
    try {
        let schema = schemas.adminUserDelete;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }

};

const addFeedback = async (req,res,next) =>{
    try{
        let schema = schemas.addFeedback;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const verifyEmail = async (req,res,next) =>{
    try{
        let schema = schemas.verifyEmail;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const resendCode = async (req,res,next) =>{
    try{
        let schema = schemas.resendCode;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const waitlistUser = async (req,res,next) =>{
    try{
        let schema = schemas.waitlistUser;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const sendEmail = async (req,res,next) =>{
    try{
        let schema = schemas.sendemail;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const profile = async (req,res,next) =>{
    try{
        let schema = schemas.profileDetails;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const terms = async (req,res,next) =>{
    try{
        let schema = schemas.terms;
        let option = options.basic;
        await schema.validateAsync({ ...req.body}, option)
        next()
    }catch(err){
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const checkReferral = async (req, res, next) => {
    try {
        let schema = schemas.checkReferralCode;
        let option = options.basic;
        await schema.validateAsync({ ...req.params }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const helpCard = async (req, res, next) => {
    try {
        let schema = schemas.helpCard;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const publicProfile = async (req, res, next) => {
    try {
        let schema = schemas.publicprofile;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};
const updateProfilePicture = async (req, res, next) => {
    try {
        let schema = schemas.updateProfilePicture;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const updateUserQuickBio = async (req, res, next) => {
    try {
        let schema = schemas.updateQuickBio;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const blockUser = async (req, res, next) => {
    try {
        let schema = schemas.blockUser;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const unBlockUser = async (req, res, next) => {
    try {
        let schema = schemas.unblockUser;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const reportUser = async (req, res, next) => {
    try {
        let schema = schemas.report;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};


const helptopic = async (req, res, next) => {
    try {
        let schema = schemas.helpTopic;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};

const updateTermsValidation = async (req, res, next) => {
    try {
        let schema = schemas.updateTermsValidation;
        let option = options.basic;
        await schema.validateAsync({ ...req.body }, option);
        next()
    } catch (err) {
        if(err)
            err.status = HTTP_UNPROCESSABLE_ENTITY
        next(err)
    }
};



module.exports = {
    signUpUser,
    loginUser,
    forgetPassword,
    resetPassword,
    existingEmail,
    createUpdateUser,
    updatePersonalDetail,
    uploadImage,
    profileImage,
    getUsers,
    usersByIds,
    changePassword,
    termsImage,
    policyUpload,
    uploadCommonFiles,
    editUserHelpTopic,
    adminUserDelete,
    updateUserSocialLink,
    addOpenQuestion,
    updateOpenQuestion,
    addFeedback,
    verifyEmail,
    waitlistUser,
    sendEmail,
    profile,
    terms,
    checkReferral,
    helpCard,
    publicProfile,
    updateProfilePicture,
    updateUserQuickBio,
    blockUser,
    unBlockUser,
    reportUser,
    helptopic,
    resendCode,
    dragUserHelpTopic,
    updatePassword,
    updateTermsValidation
}