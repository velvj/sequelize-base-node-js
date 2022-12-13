const path = require('path');
const { userService } = require('../services');
const referralInterService = require('../interService/referralInterService');
const tagpostInterService = require('../interService/tagPostInterService');
const { message, status } = require("./../configs");
const { SignUpStatus, user, signUp, SocialLoginType,UserRole } = require('../constants');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailServices = require('./mail.controller');
const jwt_decode = require("jwt-decode");
const moment = require('moment')
const { v4: uuidv4 } = require('uuid');
const { AppleAuth } = require('../configs/appleAuth');
const { Op ,Sequelize} = require("sequelize");

const { getSingedUrl } = require('../middleware/multer')

const crypto = require('crypto');


const  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

class userController { }

userController.prototype.checkReferral = async (req, res, next) => {
    try {
        if (req.body.referralCode === "111111") {
            const data = {
                status: status.HTTP_OK,
                message: message.referralVerified,
                data: {
                    "name": "Rajesh",
                    "profile": "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
                    "location": "Toronto, ON"
                },
            }
            return res.status(status.HTTP_OK).json(data)
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.refferralNotVerified })
        }
    } catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.signup = async (req, res, next) => {
    try {
        console.log("🚀 ~ file: user.controller.js ~ line 49 ~ userController.prototype.signup= ~ req", req.body)
        let emailId;
        let uuid = uuidv4()
        if (req.body.signupId == SocialLoginType.APPLE) {

            var decoded = jwt_decode(req.body.socialLoginCode);
            emailId = decoded.email;
            req.body.emailId = emailId;
        }
        else {
            emailId = req.body.emailId;
        }

        let existingUser = await userService.findUser({ emailId, signUpStatus: {
            // [Op.in]:[signUp.ACTIVE,signUp.SUSPEND],
            [Op.in]:[signUp.ACTIVE,signUp.SUSPEND,signUp.DELETE],
            }  })

        if (existingUser != null) {

            console.log(existingUser.dataValues.signUpStatus,"existingUser")
            if(existingUser.dataValues.signUpStatus === 1){
                let signupType = "Email";
                if (existingUser.socialLoginType === SocialLoginType.GOOGLE) {
                    signupType = "Google"
                } else if (existingUser.socialLoginType === SocialLoginType.APPLE) {
                    signupType = "Apple"
                }
    
                if(signupType == "Apple"){
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: "There is already an account associated with this Apple ID Please sign in" });

                }else if(signupType == "Email"){
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: "There is already an account associated with this email Please scroll down to sign in" });

                }else{
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: `User already exists Please sign in to your account using ${signupType.toLocaleLowerCase()}` })

                }
            }else if(existingUser.dataValues.signUpStatus === 2){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: `Your account has been deleted \nPlease reach out to support@getvenn.com for help` })
            }else if(existingUser.dataValues.signUpStatus === 3){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: `Your account has been suspended \nPlease reach out to support@getvenn.com for help` })
            }
        }

        let getUser = await userService.findUser({ emailId })
        if (getUser == null) {
            req.body.socialLoginType = req.body.signupId;
            req.body.statusBasedKey = uuid
            let master = await userService.createUserMaster(req.body)
            let token = jwt.sign({ userId: master.userId, emailId: master.emailId,key:uuid }, process.env.JWT_SECRET,{expiresIn:"30d"})

            req.headers.authorization = token;

            if (req.body.signupId == SocialLoginType.GOOGLE || req.body.signupId == SocialLoginType.APPLE) {

                const data = {
                    userId: master.userId,
                    emailId: master.emailId,
                    username: master.firstName + " " + master.lastName,
                    signUpStatus: SignUpStatus.EMAIL_VERIFY
                }

                userService.updateUserMaster({
                    status: SignUpStatus.EMAIL_VERIFY,
                    signUpStatus: signUp.INACTIVE,
                    createdBy: master.userId,
                    updatedBy: master.userId,
                    isSocialLogin:true,
                    statusBasedKey: uuid,
                    createdAt:new Date()
                },
                    { userId: master.userId })

                let payloads = {
                    userId: master.userId,
                    emailId: master.emailId,
                    createdBy: master.userId,
                    updatedBy: master.userId,
                }
                userService.createUserDetail(payloads);
                await tagpostInterService.userSinup(req,res,payloads); // call tagpost api
                res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created, token: token, data: data })
            }
            else {


                let val = crypto.randomInt(0, 10000);
                // let val = Math.floor(1000 + Math.random() * 9000);
                await emailServices.verifyEmail(val, req.body.emailId,req.body);
                userService.updateUserMaster({
                    status: SignUpStatus.CREATE_ACCOUNT,
                    emailVerifyCode: val,
                    createdBy: master.userId,
                    updatedBy: master.userId,
                    signUpStatus: signUp.INACTIVE,
                    statusBasedKey: uuid,
                    createdAt:new Date()
                },
                    { userId: master.userId })

                let payloads = {
                    userId: master.userId,
                    emailId: master.emailId,
                    createdBy: master.userId,
                    updatedBy: master.userId,
                }
                userService.createUserDetail(payloads);
                await tagpostInterService.userSinup(req,res,payloads); // call tagpost api
                res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created, SignUpStatus: SignUpStatus.CREATE_ACCOUNT })
            }
        }
        else {
            if (req.body.signupId == SocialLoginType.GOOGLE || req.body.signupId == SocialLoginType.APPLE) {

                let token = jwt.sign({ userId: getUser.userId, emailId: getUser.emailId,key:uuid }, process.env.JWT_SECRET,{expiresIn:"30d"})
                const data = {
                    userId: getUser.userId,
                    emailId: getUser.emailId,
                    username: req.body.firstName + " " + req.body.lastName,
                    signUpStatus: getUser.status
                }

                userService.updateUserMaster({
                    firsName: req.body.firsName,
                    lastName: req.body.lastName,
                    status: SignUpStatus.EMAIL_VERIFY,
                    signUpStatus: signUp.INACTIVE,
                    createdBy: getUser.userId,
                    updatedBy: getUser.userId,
                    isSocialLogin:true,
                    statusBasedKey: uuid,
                    createdAt:new Date()
                },
                    { userId: getUser.userId })

                res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created, token: token, data: data })
            }
            else {

                let salt = bcrypt.genSaltSync(8);
                let password = bcrypt.hashSync(req.body.password, salt);
                
                let val = crypto.randomInt(0, 10000);
                // let val = Math.floor(1000 + Math.random() * 9000);

                emailServices.verifyEmail(val, req.body.emailId,req.body)


                userService.updateUserMaster({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    password: password,
                    status: getUser.status,
                    emailVerifyCode: val,
                    signUpStatus: signUp.INACTIVE,
                    createdBy: getUser.userId,
                    updatedBy: getUser.userId,
                    statusBasedKey: uuid,
                    createdAt:new Date()
                },
                    { userId: getUser.userId })

                res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created, SignUpStatus: getUser.status })
            }
        }
        return
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.termsandconditions = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req)
        let result = await userService.findUser({ userId: decodedValue.userId });

        if (result != null) {
            if (result.dataValues.status == SignUpStatus.EMAIL_VERIFY) {
                let referralData;
                if (req.body.referralCode) {
                  referralData =
                    await referralInterService.referralDataVerification(
                      req,
                      res,
                      { ...req.body }
                    );

                  if (referralData.status != 200) {
                    return res
                      .status(status.HTTP_UNPROCESSABLE_ENTITY)
                      .json({
                        ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                        message: message.refferralNotVerified,
                      });
                  }else{

                let referralUpdate =
                  await referralInterService.updatereferralService(req, res, {
                    ...req.body,
                    userId: decodedValue.userId,
                  });

                if (referralUpdate.status != 200) {
                  return res
                    .status(status.HTTP_UNPROCESSABLE_ENTITY)
                    .json({
                      ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                      message: message.refferralNotVerified,
                    });
                }else{

                    let payloads = {
                        refferalCode: referralData ? referralData.data.refferalCode : null,
                        refferedBy: referralData ? referralData.data.userId : null,
                        refferedDate: new Date()
                    }
                    await userService.updateUserDetail(payloads,{ userId: decodedValue.userId })

                    await tagpostInterService.updateUserDetails(req,res,payloads);
                }
                  }
                }
                userService.updateUserMaster({
                    status: SignUpStatus.TERMS_AND_CONDITIONS,
                    signUpStatus: signUp.ACTIVE,
                    refferalCode: referralData ? referralData.data.refferalCode : null,
                    refferedBy: referralData ? referralData.data.userId : null,
                },
                    { userId: decodedValue.userId })


                await userService.createTermDetail({
                    userId: decodedValue.userId,
                    data: req.body.data ? req.body.data.split('?')[0].split('/').slice(-2).join('/') : null,
                });
                return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.termsAccepted, SignUpStatus: SignUpStatus.TERMS_AND_CONDITIONS })
            }
            else {
                if (result.dataValues.status == SignUpStatus.CREATE_ACCOUNT) {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.termsNotAccepted, signUpStatus: result.dataValues.status })
                }
                else {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.termsExists, signUpStatus: result.dataValues.status })
                }
            }
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.waitlist = async (req, res, next) => {
    try {
        const { emailId } = req.body
        let isUser = await userService.isUser({ 
            emailId,
             signUpStatus: {
                 [Op.not]:0
             } 
            })
        if (isUser){
            if(isUser.dataValues.signUpStatus == 1){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.existsUserSignup })
            }else if(isUser.dataValues.signUpStatus === 2){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: `Your account has been deleted \nPlease reach out to support@getvenn.com for help` })
            }else if(isUser.dataValues.signUpStatus === 3){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ ststus: status.HTTP_UNPROCESSABLE_ENTITY, message: `Your account has been suspended \nPlease reach out to support@getvenn.com for help` })
            }
        }

        let checkExists = await userService.checkExists({ emailId })

        if (checkExists)
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.existsWaitlist })

        let waitlist = await userService.createWaitlistDetail(req.body);

        let data = {};
        data.firstName = waitlist.firstName;
        data.lastName = waitlist.lastName;
        data.emailId = waitlist.emailId;
        emailServices.sendWaitlistDetail(data);

        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.resendcode = async (req, res, next) => {
    try {
        let val = crypto.randomInt(0, 10000);
        // let val = Math.floor(1000 + Math.random() * 9000);

        let result = await userService.findUser({ emailId: req.body.emailId});

        emailServices.verifyEmail(val, req.body.emailId,result)

        await userService.updateUserMaster({
            emailVerifyCode: val,
        },
            { emailId: req.body.emailId })

        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.codesend })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.sendemail = async (req, res, next) => {
    try {
        let result = await userService.findUser({ emailId: req.body.emailId , signUpStatus:{
            [Op.in]:[signUp.ACTIVE,signUp.SUSPEND,signUp.DELETE]
        }, 
        // socialLoginType:SocialLoginType.NORMAL 
     });
        console.log(result)
        if (result != null) {

            if (result.dataValues.socialLoginType === SocialLoginType.NORMAL) {
              if (result.dataValues.signUpStatus === signUp.ACTIVE) {
                let val = crypto.randomInt(0, 10000);
                // let val = Math.floor(1000 + Math.random() * 9000);
                emailServices.sendForgetPassword(val, req.body.emailId, result);

                await userService.updateUserMaster(
                  {
                    forgetPasswordCode: val,
                  },
                  { emailId: req.body.emailId }
                );

                return res
                  .status(status.HTTP_OK)
                  .json({ status: status.HTTP_OK, message: message.emailsend });
              } else if (result.dataValues.signUpStatus === signUp.DELETE) {
                return res
                  .status(status.HTTP_UNPROCESSABLE_ENTITY)
                  .json({
                    ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: `Your account has been deleted \nPlease reach out to support@getvenn.com for help`,
                  });
              } else if (result.dataValues.signUpStatus === signUp.SUSPEND) {
                return res
                  .status(status.HTTP_UNPROCESSABLE_ENTITY)
                  .json({
                    ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: `Your account has been suspended \nPlease reach out to support@getvenn.com for help`,
                  });
              }
            } else if (
              result.dataValues.socialLoginType === SocialLoginType.GOOGLE
            ) {
              return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                  ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                  message: `The account associated with this email was registered using Google Sign In.`,
                });
            } else if (
              result.dataValues.socialLoginType === SocialLoginType.APPLE
            ) {
              return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                  ststus: status.HTTP_UNPROCESSABLE_ENTITY,
                  message: `The account associated with this email was registered using Apple Sign In.`,
                });
            } else {
              return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                  status: status.HTTP_UNPROCESSABLE_ENTITY,
                  message: message.emailNotFound,
                });
            }
            
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.emailNotFound })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.updatestatus = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        userService.updateUserMaster({
            status: SignUpStatus.SETUP_HELP_PROVIDER,
        },
            { userId: decodedValue.userId }
        )

        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.updated })

    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.verifyemailcode = async (req, res, next) => {
    try {
        const { emailId } = req.body;
        let result = await userService.findUser({ emailId: emailId });

        if (result != null) {
            let isoDate = new Date().toISOString()
            var d1 = new Date(result.dataValues.updatedAt), // 10:09 to
                d2 = new Date(isoDate); // 10:20 is 11 mins
            var diff = d2 - d1;




            let sec = Math.floor(diff / 1e3)

            if (sec <= 300) {
                if (req.body.code == result.dataValues.forgetPasswordCode) {

                    return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.codeVerified })
                }
                else {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.codeNotVerified })
                }
            }
            else {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.codeExpired })
            }
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotFound })
        }

    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.updatepassword = async (req, res, next) => {
    try {

        let result = await userService.findUser({ emailId: req.body.emailId });
        if (result != null) {
            var isCorrect = await bcrypt.compare(req.body.password, result.password);

            if (isCorrect) {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.passwordExists })
            }

            let salt = bcrypt.genSaltSync(8);
            let password = bcrypt.hashSync(req.body.password, salt);

            await userService.updateUserMaster({
                password: password,
            },
                { emailId: req.body.emailId });

            emailServices.paswordConfirmation( req.body.emailId,result.firstName)
            

            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.passwordUpdate })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotFound })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.profile = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req)
        let result = await userService.findUser({ userId: decodedValue.userId });

        if (result != null) {
            if (result.dataValues.status == SignUpStatus.TERMS_AND_CONDITIONS || result.dataValues.status == SignUpStatus.BASIC_PROFILE) {

                let payloads = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    country: req.body.country,
                    state: req.body.state,
                    abbrevation: req.body.abbrevation,
                    city: req.body.city,
                    likes: 0,
                    helps: 0,
                    signupStatus:result.dataValues.signUpStatus
                    //  socialLinks:[],
                    //  helpKeywords:[],
                    //  refferedBy:(req.body.refferedBy)?req.body.refferedBy:[],
                    //  refferalCode:[], 
                        
                }

                await userService.updateUserDetail(payloads,{ userId: decodedValue.userId })
                await tagpostInterService.updateUserDetails(req,res,payloads);  // call tagpost api

                userService.updateUserMaster({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    status: SignUpStatus.BASIC_PROFILE,
                },
                    { userId: decodedValue.userId })

                    if(result.dataValues.status == SignUpStatus.TERMS_AND_CONDITIONS){
                        await referralInterService.userGenerrateReferralCode(req,res);
                    }

                let userProfile = await userService.findProfile({ userId: decodedValue.userId });

                userProfile.dataValues.state = userProfile.dataValues.abbrevation ? userProfile.dataValues.abbrevation : userProfile.dataValues.state
                return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created, SignUpStatus: SignUpStatus.BASIC_PROFILE, data: userProfile })
            }
            else {
                if (result.dataValues.status == SignUpStatus.CREATE_ACCOUNT) {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.termsNotAccepted, signUpStatus: result.dataValues.status })
                }
                else if (result.dataValues.status == SignUpStatus.EMAIL_VERIFY) {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.profileFailed, signUpStatus: result.dataValues.status })
                }
                else {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.existsEmail })
                }
            }
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.verifyEmail = async (req, res, next) => {
    try {
        const { emailId } = req.body;
        let result = await userService.findUser({ emailId: emailId });

        if (result != null) {
            let isoDate = new Date().toISOString()
            var d1 = new Date(result.dataValues.updatedAt), // 10:09 to
                d2 = new Date(isoDate); // 10:20 is 11 mins
            var diff = d2 - d1;
            let sec = Math.floor(diff / 1e3)

            if (sec <= 300) {
                if (req.body.code == result.dataValues.emailVerifyCode) {
                    let token = jwt.sign({ userId: result.dataValues.userId, emailId: result.dataValues.emailId, key: result.dataValues.statusBasedKey}, process.env.JWT_SECRET,{expiresIn:"30d"})

                    const data = {
                        userId: result.dataValues.userId,
                        emailId: result.dataValues.emailId,
                        username: result.dataValues.firstName + " " + result.dataValues.lastName,
                        signUpStatus: SignUpStatus.EMAIL_VERIFY
                    }

                    await userService.updateUserMaster({
                        status: SignUpStatus.EMAIL_VERIFY,
                        createdBy: result.dataValues.userId,
                        updatedBy: result.dataValues.userId,
                        token: token
                    },
                        { userId: result.dataValues.userId })
                    return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.userVerified, token: token, data: data })
                }
                else {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotVerified })
                }
            }
            else {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.codeExpired })
            }
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotFound })
        }

    } catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.login = async (req, res, next) => {
    try {

        const { emailId, password } = req.body;
        let result = await userService.findUser({ emailId: emailId,typeId:UserRole.END_USER });
        if (result != null) {
            if((result.signUpStatus == signUp.ACTIVE || result.signUpStatus == signUp.SUSPEND)){
                const userData = result.toJSON()
                let userProfile = await userService.findProfile({ userId: userData.userId });
    
                delete userData.password;
    
                if (result.socialLoginType === SocialLoginType.GOOGLE) {
                    let signupType = "Google";
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ message: `As per sign-up, please use ${signupType} login to continue.` })
                }
                else if (result.socialLoginType === SocialLoginType.APPLE) {
                    let signupType = "Apple";
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ message: `As per sign-up, please use ${signupType} login to continue.` })
                }
    
                var isCorrect = await bcrypt.compare(password, result.password);
                if (isCorrect) {
                    let token = jwt.sign({ userId: userData.userId, emailId: userData.emailId, key: result.statusBasedKey }, process.env.JWT_SECRET,{expiresIn:"30d"});
    
                    // let acceptedTermAndCondition = await userService.findUserLatestTermsAndCondition({userId:userData.userId})
                    // let latestTermAndCondition = await userService
    
                    userProfile.dataValues.userImage = userProfile.dataValues.userImage ? getSingedUrl(userProfile.dataValues.userImage) : "" ;
                    userProfile.dataValues.state = userProfile.dataValues.abbrevation ? userProfile.dataValues.abbrevation : userProfile.dataValues.state
                    userProfile.dataValues.signUpStatus = userData.status;
                    userProfile.dataValues.userStatus = userData.signUpStatus;
                    userProfile.dataValues.username = userData.firstName + " " + userData.lastName;
                    userService.updateUserMaster({
                        token: token
                    },
                        { userId: userData.userId })
    
                    return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.userLoggedIn, token: token, data: userProfile })
                }
                else {
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userInvalidCredentials })
                }
                
            }else if(result.signUpStatus == signUp.DELETE){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.accountDeleted })

            }
            else{
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userInvalidCredentials })
            }
        } else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.notExistUser })
        }
    }
    catch (error) {
        next(error)
    }
}


userController.prototype.sociallogin = async (req, res, next) => {
    try {

        let emailId;
        if (req.body.signupId == SocialLoginType.APPLE) {

            var decoded = jwt_decode(req.body.socialLoginCode);
            emailId = decoded.email;
            req.body.emailId = emailId;
        }
        else {
            emailId = req.body.emailId;
        }

        let result = await userService.findUser({ emailId: emailId });

        if (result != null) {

            if(result.signUpStatus == signUp.ACTIVE || result.signUpStatus == signUp.SUSPEND){
                const userData = result.toJSON();
            let userProfile = await userService.findProfile({ userId: userData.userId });

            delete userData.password;

            if (result.socialLoginType === SocialLoginType.NORMAL) {
                let signupType = "Email";
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ message: `As per sign-up, please use ${signupType} login to continue.` })
            }

            if (req.body.signupId == result.socialLoginType) {
                let token = jwt.sign({ userId: userData.userId, emailId: userData.emailId,key:userData.statusBasedKey }, process.env.JWT_SECRET,{expiresIn:"30d"})

                // const data = {
                //     userId: userData.userId,
                //     emailId: userData.emailId ,
                //     username: userData.firstName +" "+userData.lastName ,
                //     userProfile.signUpStatus:userData.status,
                // }
                userProfile.dataValues.userImage = userProfile.dataValues.userImage ? getSingedUrl(userProfile.dataValues.userImage) : "" ;
                userProfile.dataValues.state = userProfile.dataValues.abbrevation ? userProfile.dataValues.abbrevation : userProfile.dataValues.state
                userProfile.dataValues.userStatus = userData.signUpStatus;
                userProfile.dataValues.signUpStatus = userData.status;
                userProfile.dataValues.username = userData.firstName + " " + userData.lastName;
                userService.updateUserMaster({
                    token: token,
                    socialLoginCode: req.body.socialLoginCode
                },
                    { userId: userData.userId })
                return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.userLoggedIn, token: token, data: userProfile })
            }
            else {
                if (result.socialLoginType === SocialLoginType.GOOGLE) {
                    let signupType = "Google";
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ message: `As per sign-up, please use ${signupType} login to continue.` })
                }
                else {
                    let signupType = "Apple";
                    return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ message: `As per sign-up, please use ${signupType} login to continue.` })
                }
            }

            }else if(result.signUpStatus == signUp.DELETE){
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.accountDeleted })

            }
            else{
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userInvalidCredentials })
            }
        } else {
            let err = new Error(message.userInvalidCredentials)
            err.status = status.HTTP_BAD_REQUEST
            return next(err)
        }
    }
    catch (error) {
        next(error)
    }
}



userController.prototype.logout = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req)
        let result = await userService.findUser({ userId: decodedValue.userId });

        if (result != null) {
            await userService.updateUserMaster({
                token: null,
            },
                { userId: decodedValue.userId })
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.userLoggedOut })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotLoggedOut })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.publicprofile = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        let result = await userService.findProfile({ userId: decodedValue.userId });

        if (result != null) {
            let payloads = {
                userImage: req.body.image,
                likes: 0,
                helps: 0,
                userBio: req.body.userBio,
            }
            await userService.updateUserDetail(payloads,{ userId: decodedValue.userId });
            await tagPostInterService.updateUserDetails(req,res,payloads); // called tagpost api
            let links = req.body.socialLinks;
            for (const item of links) {
                let socialLink = {
                    userId: decodedValue.userId,
                    socialLinkName: item.name,
                    socialLink: item.link
                }
                await userService.createSocialLinks(socialLink)
            }

            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.viewpublicprofile = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        let result = await userService.findUserProfile({ userId: decodedValue.userId });

        if (result) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: result })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    } catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.updatepublicprofile = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        let result = await userService.findProfile({ userId: decodedValue.userId });

        if (result != null) {
            let payloads = {
                userImage: req.body.image,
                userBio: req.body.userBio,
            }
            await userService.updateUserDetail(payloads, { userId: decodedValue.userId });
            await tagpostInterService.updateUserDetails(req,res,payloads); // called tagpost api 

            let links = req.body.socialLinks;
            for (const item of links) {
                await userService.updateSocialLinks({
                    socialLink: item.link
                }, { userId: decodedValue.userId, socialLinkName: item.name })
            }

            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.updated })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.state = async (req, res, next) => {
    try {
        let state = await userService.findState({ country_id: req.params.value });

        if (state.length) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: state })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.invalidCountryId })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.city = async (req, res, next) => {
    try {
        let city = await userService.findCity({ state_id: req.params.value });

        if (city.length) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: city })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.invalidStateId })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.blockuser = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)

        await userService.createBLockReportDetail({
            userId: req.body.blockedUserId,
            type: user.BLOCKED,
            createdBy: decodedValue.userId,
        })
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.unblockuser = async (req, res, next) => {
    try {

        await userService.getUserId(req)

        await userService.unBLockReportUserDetail({
            userId: req.body.unblockedUserId,
            type: user.BLOCKED,
        })
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.reportuser = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req);
        let result = await userService.findUser({ userId: req.body.reportUserId });
        let findReportingUser = await userService.findUser({userId: decodedValue.userId})

        let reportedUserFirstName,reportedUserLastName,reportedUserId;
 
        if (result && findReportingUser) {
        if(result.firstName){
            reportedUserFirstName = result.firstName; 
            reportedUserLastName = result.lastName;
            reportedUserId = result.userId
        }
        else{
            reportedUserFirstName = "Unknown";
            reportedUserLastName= "User";
            reportedUserId = null
        }
        await userService.createBLockReportDetail({
            userId: req.body.reportUserId,
            reason: req.body.reason,
            type: user.REPORTED,
            createdBy: decodedValue.userId,
        })

        let data = {};
        data.reportedUserFirstName = reportedUserFirstName;
        data.reportedUserLastName = reportedUserLastName
        data.reportedUserId = reportedUserId;
        data.reportedUserEmail = result.emailId;
        data.reportingUserFirstName = findReportingUser.firstName;
        data.reportingUserLastName = findReportingUser.lastName;
        data.reportingUserEmail = findReportingUser.emailId;
        data.reportingUserId = findReportingUser.userId;
        data.reason = req.body.reason;

        emailServices.sendReportDetail(data);
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull })
    }else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.inviteIncrementRequest = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req);
        let result = await userService.findUser({ userId: decodedValue.userId });

        let userFirstName,userLastName,userId;
 
        if (result) {
        if(result.firstName){
            userFirstName = result.firstName; 
            userLastName = result.lastName;
            userId = result.userId
        }
        else{
            userFirstName = "Unknown";
            userLastName= "User";
            userId = null
        }
        await userService.createBLockReportDetail({
            userId: req.body.reportUserId,
            reason: req.body.reason,
            type: user.REPORTED,
            createdBy: decodedValue.userId,
        })

        let data = {};
        data.userFirstName = userFirstName;
        data.userLastName = userLastName
        data.userId = userId;
        data.userEmail = result.emailId;

        emailServices.sendInviteRequestDetail(data);
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull })
    }else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.viewBlockUser = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        let result = await userService.viewBlockUsers({ createdBy: decodedValue.userId });

        if (result) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: result })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.createhelptopic = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)
        let topics = req.body;

        for (const item of topics) {
            let findTopic = await userService.findHelpTopicDetail({ "topicName": item.topicName, "userId": decodedValue.userId });

            if (findTopic) {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.topicExists })
            }

            let result = await userService.viewhelptopic({ userId: decodedValue.userId });

            console.log(result);
            if (result.length >= 15) {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.countExists })
            }

            let createTopicDetails = await userService.createHelpTopicDetail({
                userId: decodedValue.userId,
                topicName: item.topicName,
                experience: item.userExperience,
                tagline: item.tagline,
                orderId: result.length ? Math.max.apply(Math, result.map(val=> val.orderId)) + 1 : 1,
                createdBy: decodedValue.userId,
            })

            let keywords = item.helpKeywords;

            for (const item1 of keywords) {
                userService.createHelpKeywords({
                    userId: decodedValue.userId,
                    topicId: createTopicDetails.topicId,
                    keywords: item1,

                });
            }
        }
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.viewhelptopic = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req)
        let result = await userService.viewhelptopic({ userId: decodedValue.userId });

        if (result) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: result })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.edithelptopic = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req)

        let result = await userService.findhelptopic({ userId: decodedValue.userId, topicId: req.body.topicId });

        if (result != null) {
            await userService.updateTopicDetail({
                topicName: req.body.topicName,
                experience: req.body.userExperience,
                tagline: req.body.tagline,
            },
                { topicId: req.body.topicId })

            let keywords = req.body.helpKeywords;
            await userService.deleteHelpRecords({ topicId: req.body.topicId });

            for (const item of keywords) {
                userService.createHelpKeywords({
                    topicId: req.body.topicId,
                    userId: decodedValue.userId,
                    keywords: item,

                });
            }
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.updated })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.suggestKeywords = async (req, res, next) => {
    try {

        let result = await userService.getKeywords({ keywords: req.params.value });

        const filteredArr = result.reduce((acc, current) => {
            const x = acc.find(item => item.keywords === current.keywords);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        if (filteredArr) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: filteredArr })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.appleLogin = async (req, res, next) => {
    try {

        console.log(req.body)
        let data = req.body;

        // Return the user
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: err.message || err });
    }
}

userController.prototype.uploadImage = async (req, res, next) => {
    try {
        let file = await getSingedUrl(req.body.questionImg)
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull, data: {questionImg:file}})

    } catch (error) {
        next(error)
    }
}

userController.prototype.commonFileUpload = async (req, res, next) => {
    try {
        let file = await getSingedUrl(req.body.commonFile)
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull, data: {commonFile:file} })

    } catch (error) {
        next(error)
    }
}

userController.prototype.uploadTermsImage = async (req, res, next) => {
    try {
        let file = await getSingedUrl(req.body.termsImg)
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull, data: {termsImg:file} })

    } catch (error) {
        next(error)
    }
}

userController.prototype.policyUpload = async (req, res, next) => {
    try {
        let file = await getSingedUrl(req.body.policyContent)
        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull, data: {policyContent:file }})

    } catch (error) {
        next(error)
    }
}

userController.prototype.acceptTermsAndCondtion = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req)


        await userService.createTermDetail({
            userId: decodedValue.userId,
            termMaserId: req.body.termsId,
            data: req.body.terms,
        });

        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull })

    } catch (error) {
        next(error)
    }
}


userController.prototype.verifyLatestTermsAndCondition = async (req, res, next) => {


    try {
        let decodedValue = await userService.getUserId(req)

        let findAceptedLatestTerms = await userService.findLatestAcceptedTerms({ "userId": decodedValue.userId });

        let latestTermsAndCondition = await userService.updatedTermsAndCondition({});

        let result;
        if (findAceptedLatestTerms && latestTermsAndCondition) {

            if (findAceptedLatestTerms.termMaserId === latestTermsAndCondition.termsId) {

                result = {
                    latestTermsAccepted: true,
                    data: {}
                }

            } else {
                result = {
                    latestTermsAccepted: false,
                    data: latestTermsAndCondition
                }

            }
        } else {

            result = {
                latestTermsAccepted: false,
                data: latestTermsAndCondition
            }
        }

        return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.successfull, data: result })

    } catch (error) {
        next(error)
    }
}

userController.prototype.userProfileDetails = async (req, res, next) => {
    try {
        let result = await userService.findUserProfile(req, res);

        let findUserMasterDetails = await userService.findUser({userId: req.user.userId});

        result.dataValues.state = result.dataValues.abbrevation ? result.dataValues.abbrevation : result.dataValues.state 
        result.dataValues.isSocialLogin = findUserMasterDetails.dataValues.isSocialLogin;
        result.dataValues.socialLoginType = findUserMasterDetails.dataValues.socialLoginType;
        if(result.dataValues.referredUserDetail){
            result.dataValues.referredUserDetail['refferedDate'] = result.dataValues.refferedDate
        }

        if (result != null) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: message.created,
                    data: result,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

userController.prototype.userProfilePicture = async (req, res, next) => {
    try {
        let result = await userService.findProfilePicture({ userId: req.user.userId });

        if (result != null) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: message.successfull,
                    data: result,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

userController.prototype.updateUserProfilePictiure = async (req, res) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            userImage: req.body.commonFile.split('?')[0].split('/').slice(-2).join('/')
        }

        let profilePicture = await userService.updateUserProfile(
            payloads,
            { userId: decodedValue.userId }
        );
        let tagpostUpdateUserInfo = await tagpostInterService.updateUserDetails(req,res,payloads);

        if (profilePicture[0] == 1 && tagpostUpdateUserInfo.data.status == 200) {
            return res
                .status(status.HTTP_OK)
                .json({ status: status.HTTP_OK, message: message.updated });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.notUpdated,
                });
        }
    } catch (error) {
        return res.status(500).json({ message: err.message || err });
    }
};

userController.prototype.updateUserQuickBio = async (req, res) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            userBio: req.body.userBio
        }

        let updateBio = await userService.updateUserBio(
            payloads,
            { userId: decodedValue.userId }
        );
        let tagpostUserupdateInfo = await tagpostInterService.updateUserDetails(req,res,payloads) // called tagpost microservice api 
        if (updateBio[0] == 1 && tagpostUserupdateInfo.data.status == 200) {
            return res
                .status(status.HTTP_OK)
                .json({ status: status.HTTP_OK, message: message.updated });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.notUpdated,
                });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
};
userController.prototype.changePassword = async (req, res, next) => {
    try {

        let decodedValue = await userService.getUserId(req);

        let result = await userService.findUser({ userId: decodedValue.userId });
        if (result != null) {
            var isCorrect = await bcrypt.compare(req.body.oldPassword, result.password);

            console.log(isCorrect)
            if (!isCorrect) {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.oldPasswordNotMatched })
            }

            var samePasswordValidation = await bcrypt.compare(req.body.newPassword, result.password)

            if (samePasswordValidation) {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.passwordExists })
            }

            let salt = bcrypt.genSaltSync(8);
            let password = bcrypt.hashSync(req.body.newPassword, salt);

            await userService.updateUserMaster({
                password: password,
            },
                { userId: decodedValue.userId })

            emailServices.paswordConfirmation(result.emailId,result.firstName)
            

            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.changepassword })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotFound })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

const tagPostInterService = require('../interService/tagPostInterService');

userController.prototype.updateUserSocialLink = async (req, res) => {
    try {
        let decodedValue = await userService.getUserId(req);

        await userService.deleteUserSocialLink({ userId: decodedValue.userId });

        let socialLinkList = req.body.linkDetails;
        socialLinkList.map((val) => val.userId = decodedValue.userId)
        await userService.createUserSocialLink(socialLinkList);


        return res
            .status(status.HTTP_OK)
            .json({ status: status.HTTP_OK, message: message.updated });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: err.message || err });
    }
};

userController.prototype.userDetails = async (req, res, next) => {
    try {
        let result = await userService.userBasicInformation(req, res);

        if (result != null) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: message.created,
                    data: result,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};


userController.prototype.userMasterDetails = async (req, res, next) => {
    try {

        let result = await userService.findUser({ userId: req.params.userId,signUpStatus:{
            [Op.in]:[signUp.ACTIVE,signUp.SUSPEND]
        } })

        if (result != null) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: "success",
                    data: result,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

userController.prototype.allUserDetails = async (req, res, next) => {
    try {
        let result = await userService.allUserBasicInformation(req, res);

        if (result != null) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: message.created,
                    data: result,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};


userController.prototype.updatePersonalInfo = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let userId = decodedValue.userId;
        let payload = {
            firstName: req.body.name,
            lastName: req.body.sureName,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            abbrevation: req.body.abbrevation
        }
        let userDetails = await userService.updateUserDetail(payload, { userId: userId });
        let userMaster = await userService.updateUserMaster(payload, { userId: userId });
        let tagpostUserUpdateInfo = await tagpostInterService.updateUserPersonalInfo(req,res,req.body);
        if (userDetails[0] >= 1 && userMaster[0] >= 1 && tagpostUserUpdateInfo.data.status ===200) {
            let findUerDetails = await userService.findUserDetail({userId});

            findUerDetails.dataValues.username = findUerDetails.dataValues['firstName'] + ' ' + findUerDetails.dataValues['lastName']
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.updated,data: findUerDetails })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.notUpdated })
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
}

userController.prototype.getUserPersonalInfo = async(req,res,next) =>{
    try{
        let decodedValue = await userService.getUserId(req);
        let personalDetail = await userService.findUserDetail({userId: decodedValue.userId});
        let findUserMasterDetails = await userService.findUser({userId: decodedValue.userId});

        personalDetail.dataValues.stateFullName = personalDetail.dataValues.state;
        personalDetail.dataValues.state = personalDetail.dataValues.abbrevation;
        personalDetail.dataValues.isSocialLogin = findUserMasterDetails.dataValues.isSocialLogin;
        personalDetail.dataValues.socialLoginType = findUserMasterDetails.dataValues.socialLoginType;
        personalDetail.dataValues.username = personalDetail.dataValues['firstName'] + ' ' +personalDetail.dataValues['lastName'];
            
        if(personalDetail){
            res.status(status.HTTP_OK).json({status:status.HTTP_OK, message: message.successfull, data : personalDetail})
        }
        else{
            res.status(status.HTTP_NO_CONTENT).json({status:status.HTTP_NO_CONTENT, message: message.noRecord})
        }

    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.userFeedback = async (req, res, next) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            userId: decodedValue.userId,
            feedbackContent: req.body.feedbackContent,
        }

        let result = await userService.findUser({ userId: decodedValue.userId });
        console.log(result);
        let firstName,lastName;
 
        if(result.firstName){
            firstName = result.firstName;
            lastName = result.lastName;              
        }
        else{
            firstName = "Unknown";
            lastName = "User"
        }

        let reason = req.body.feedbackContent

        if(reason){
            reason = reason.replace("\n","<br/>")
        }

        let data = {};
        data.firstName = firstName;
        data.lastName = lastName;
        data.emailId = result.emailId;
        data.reason = reason;
        data.userId = decodedValue.userId;

        emailServices.sendFeedbackDetails(data);

        let createFeedback = await userService.createFeedback(payloads);
        if (createFeedback) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.created })
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
}

userController.prototype.deleteAccount = async (req,res,next) =>{
    try{
        let decodedValue = await userService.getUserId(req);
        let payload = {
            userId: decodedValue.userId,
            body :{
                emailId: decodedValue.emailId
            }
            
        }
        let checkUser = await tagpostInterService.checkUser(req,res,payload);
        if(checkUser.data.status == 200){
            let userDetails = await userService.updateUserDetail({signupStatus: signUp.DELETE}, { userId: decodedValue.userId});
            let userMaster = await userService.updateUserMaster({signUpStatus: signUp.DELETE}, { userId: decodedValue.userId });
            let tagpostMS = await tagpostInterService.deleteAccount(req,res,req.body);
            if (userDetails[0] >= 1 && userMaster[0] >= 1 && tagpostMS.data.status == 200) {

                let payloads = {
                    payload: { status: "DELETED" },
                    where: { "userId": decodedValue.userId }
                  }
                await tagpostInterService.updateQuestionDetails(req, res, payloads);
                

                let { data } =await tagpostInterService.findAllOpenQuestionDetail(req, res, {userId: decodedValue.userId})
                let userQuestionList = data.data;


                let OQHistoryList = [];


                let findUserData = await userService.findProfile({userId:decodedValue.userId})
                await emailServices.userDeleteAccount(findUserData.dataValues.emailId,findUserData.dataValues.firstName);

                if(userQuestionList.length){


                    userQuestionList.map((val)=>{
                        
                        let listFormat = {
                            userId: decodedValue.userId,
                            questionId: val.questionId,
                            status:"DELETED"
                        }
                        OQHistoryList.push(listFormat)

                    })
                    await tagPostInterService.createQuestionStatusDetails(req, res, OQHistoryList);

                }

                
                return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, message: message.deleted})
            }
            else {
                return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.notDeleted })
            }
        }
        else{
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status:status.HTTP_UNPROCESSABLE_ENTITY, message: checkUser.data.message })
        }


    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.getTerms = async(req,res,next) =>{
    try{
        let getData = await userService.getLatestTerms();
        let termContent = {
            termsId : getData[0].dataValues['termsId'],
            policy:await getSingedUrl(getData[0].dataValues['terms'])
        }
        res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.successfull, terms: termContent});
    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.getPolicy = async(req,res,next) =>{
    try{
        let getData = await userService.getLatestPolicy();
        let policyContent = {
            policyId : getData[0].dataValues['policyId'],
            policy: await getSingedUrl(getData[0].dataValues['policy'])
        };
        res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.successfull, policy: policyContent});
    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.findBlockedUserList = async (req, res, next) => {
    try {
        let findBlockedUserList = await userService.viewBlockUsers({ createdBy: req.body.createdBy });

        if (findBlockedUserList) {
            return res.status(status.HTTP_OK).json({ status: status.HTTP_OK, data: findBlockedUserList })
        }
        else {
            return res.status(status.HTTP_UNPROCESSABLE_ENTITY).json({ status: status.HTTP_UNPROCESSABLE_ENTITY, message: message.userNotExist })
        }
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

userController.prototype.updateUserSearchCount = async (req, res) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let payloads = {
             searchCount: Sequelize.literal("VNU02_SEARCH_COUNT + 1") 
        }

        console.log(payloads);
        let updateUserInfo = await userService.updateUserDetail(
            payloads,
            { userId: decodedValue.userId }
        );

        if (updateUserInfo) {
            return res
                .status(status.HTTP_OK)
                .json({ status: status.HTTP_OK, message: message.updated });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.notUpdated,
                });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
};


userController.prototype.updateUserHelpCount = async (req, res) => {
    try {
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            helps: Sequelize.literal("VNU02_HELPED_COUNT_D + 1") 
        }

        console.log(payloads);
        let updateUserInfo = await userService.updateUserDetail(
            payloads,
            { userId: decodedValue.userId }
        );

        if (updateUserInfo) {
            return res
                .status(status.HTTP_OK)
                .json({ status: status.HTTP_OK, message: message.updated });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.notUpdated,
                });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
};

userController.prototype.getOverlayDetails = async (req, res, next) =>{
    try{
        let getData = await userService.findOverlayDetails({userId:req.user.userId});
        let firstTimeUserDetails = {
            userId : getData.dataValues['userId'],
            firstTimeUser: getData.dataValues['firstTimeUser']
        }
        res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.successfull, data:firstTimeUserDetails});
        }catch(err){
        console.log(err);
        next(err);
    }
} 

userController.prototype.updateOverlayDetails = async (req, res, next) =>{
    try{
        await userService.updateUserMaster({firstTimeUser:req.body.firstTimeUser},{userId:req.user.userId});

        res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.successfull});
        }catch(err){
        console.log(err);
        next(err);
    }
}


userController.prototype.updateLikes = async(req,res,next) =>{
    try{
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            userId: req.params.userId,
            likeBy: decodedValue.userId
        };

        let result = await userService.findUser({ userId: req.params.userId });

        if(!result){
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.userNotExist,
                });
        }

        let checkUser = await userService.getlikes(payloads);
        if(!checkUser){
            await userService.updateLikes({userId: payloads.userId});
            await userService.createLikes(payloads);
            await tagpostInterService.updateUserLikes(req,res,{userId: req.params.userId }); 
        }else{
            let { dataValues } = checkUser;
            let status;
            let where = {
                userId: req.params.userId
            }
            if(dataValues.status == 1){
                status = 0;
                await userService.disLikes(where);
                await userService.changeLikes(status,where);
                await tagpostInterService.userDislikes(req,res,where);
            }else{
                status = 1
                await userService.updateLikes({userId: payloads.userId});
                await userService.changeLikes(status,where);
                await tagpostInterService.updateUserLikes(req,res,{userId: req.params.userId });
            }
        }
        
        return res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.updated});
    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.getLikeDetails = async(req,res,next) =>{
    try{
        let decodedValue = await userService.getUserId(req);
        let payloads = {
            userId: req.params.userId,
            likeBy: decodedValue.userId
        };
        let checkUser = await userService.getlikes(payloads);
        let responseData;
        if(!checkUser){
             responseData = {
                 like:false
             }
        }else{
            let { dataValues } = checkUser;

            if(dataValues.status == 1){
                responseData = {
                    like:true
                }
            }else{
                responseData = {
                    like:false
                }
            }
        }
        
        return res.status(status.HTTP_OK).json({status: status.HTTP_OK, message: message.successfull,data:responseData});
    }catch(err){
        console.log(err);
        next(err);
    }
}

userController.prototype.sessionDetails = async (req, res, next) => {
    try {

        let sessionList = []

        let session = req.body.sessionList
        await asyncForEach(session, async (item, i) => { 

            let resultObj = {}
            resultObj.userId = item.userId;
            resultObj.date = moment(parseInt(item.startTime)).format('L');
            resultObj.startTime = moment(parseInt(item.startTime)).format('YYYY-MM-DD HH:mm:ss');
            resultObj.endTime = moment(parseInt(item.endTime)).format('YYYY-MM-DD HH:mm:ss');

            sessionList.push(resultObj);
        })

        let addSession = await userService.createSessionDetails(sessionList);

        if (addSession) {
            return res
                .status(status.HTTP_OK)
                .json({
                    status: status.HTTP_OK,
                    message: message.created,
                });
        } else {
            return res
                .status(status.HTTP_UNPROCESSABLE_ENTITY)
                .json({
                    status: status.HTTP_UNPROCESSABLE_ENTITY,
                    message: message.notUpdated,
                });
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
};



userController.prototype.sessionCalculation = async (req, res, next) => {
    try {

      let s6=await userService.calculatesS6({ userId:req.body.userId});

          return res.status(status.HTTP_OK).json({
            status: status.HTTP_OK,
            message: message.successfull,
            data:s6
          });
        
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

userController.prototype.activeSeassionCalculationForFourteenDays = async (req, res, next) => {
    try {
        
        let activeSessionCalculation14Days =
        await userService.activeSessionCalculationFor14Days({
          userId: req.body.userId,
        });

          return res.status(status.HTTP_OK).json({
            status: status.HTTP_OK,
            message: message.successfull,
            data:activeSessionCalculation14Days
          });
        
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  userController.prototype.activeSeassionCalculationForThirtyDays = async (req, res, next) => {
    try {
        
        let activeSessionCalculation30Days =
        await userService.activeSessionCalculationFor30Days({
          userId: req.body.userId,
        });

          return res.status(status.HTTP_OK).json({
            status: status.HTTP_OK,
            message: message.successfull,
            data:activeSessionCalculation30Days
          });
        
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };


  const CSVToJSON = require('csvtojson');
userController.prototype.sync = async (req, res, next) => {
    try {
       
        let filePath = "/Users/edwinm/Desktop/Canada-state-city - Cities and towns Canada.csv";
    const products = await CSVToJSON().fromFile(filePath);
    let state=[ "AB",
                "BC",
                "MB",
                "NB",
                "NL",
                "NT",
                "NS",
                "NU",
                "ON",
                "PE",
                "QC",
                "SK",
                "YT"
            ];
    for(const item of state){

        let data={
            country_id: 38,
            label:item

        }

        let createstate = await userService.createstate(data);
        console.log(createstate.value)


        for(const item1 of products){

            if(item1[item]){
                
            let data1={
                state_id: createstate.value,
                label:item1[item]
            }
            await userService.createcity(data1);

        }
        }
    }
    res.send(products)

    } 
    catch (error) {
        console.log(error)
        return next(error)
    }
}


userController.prototype.sync1 = async (req, res, next) => {
    try {
       
        let filePath = "/Users/edwinm/Desktop/US States and Citys - USA States-Cities.csv";
    const products = await CSVToJSON().fromFile(filePath);
 
    let state=[
        "AL",
            	"AK",
                "AZ",
                "AR",
                "CA",
                "CO",
                "CT",
                "DC",
                "DE",
                "FL",
                "GA",
                "HI",
                "ID",
                "IL",
                "IN",
                "IA",
                "KS",
                "KY",
                "LA",
                "ME",
                "MD",
                "MA",
                "MI",
                "MN",
                "MS",
                "MO",
                "MT",
                "NE",
                "NV",
                "NH",
                "NJ",
                "NM",
                "NY",
                "NC",
                "ND",
                "OH",
                "OK",
                "OR",
                "PA",
                "RI",
                "SC",
                "SD",
                "TN",
                "TX",
                "UT",
                "VT",
                "VA",
                "WA",
                "WV",
                "WI",
                "WY"

            ];
    for(const item of state){

        let data={
            country_id: 231,
            label:item

        }

        let createstate = await userService.createstate(data);
        console.log(createstate.value)


        for(const item1 of products){

            if(item1[item]){
            let data1={
                state_id: createstate.value,
            label:item1[item]
            
            }

            await userService.createcity(data1);
        }
        }

    }
    res.send(products)

    } 
    catch (error) {
        console.log(error)
        return next(error)
    }
}

module.exports = new userController()