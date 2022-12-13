const express = require("express");
const userRoutes = express.Router();
const { uploadImage, termsImage, policyUpload, uploadCommonFiles, updatePersonalDetail,addFeedback,signUpUser,changePassword, loginUser, verifyEmail, waitlistUser, sendEmail, profile, terms, publicProfile, updateProfilePicture, updateUserQuickBio, blockUser, unBlockUser, reportUser,  resendCode,updatePassword } = require('../../middleware/user.validator')

const {
    userController, authController: { verifyAuth,verifyUserAuth,verifyInterServiceAuth }
} = require('../../controllers');
const { user } = require("../../constants");

// Open Routes
userRoutes.post('/signup' ,signUpUser, userController.signup);
userRoutes.post('/verifyEmail', verifyEmail, userController.verifyEmail);
userRoutes.post('/waitlist', waitlistUser , userController.waitlist);
userRoutes.post('/resendcode',resendCode, userController.resendcode);

userRoutes.post('/sendemail',sendEmail, userController.sendemail);
userRoutes.post('/verifyemailcode',verifyEmail, userController.verifyemailcode);
userRoutes.post('/updatepassword',updatePassword, userController.updatepassword);

//Login Routes
userRoutes.post('/login',loginUser, userController.login);
userRoutes.post('/logout', verifyAuth, userController.logout);
userRoutes.post('/sociallogin', userController.sociallogin);

//Auth Routes
userRoutes.post('/profile', verifyAuth,verifyUserAuth, profile, userController.profile);
userRoutes.post('/terms', verifyAuth, terms, userController.termsandconditions);

//Profile Routes
userRoutes.post('/publicprofile', verifyAuth,verifyUserAuth,publicProfile, userController.publicprofile);
userRoutes.get('/publicprofile', verifyAuth,verifyUserAuth, userController.viewpublicprofile)
userRoutes.put('/publicprofile', verifyAuth,verifyUserAuth, publicProfile,userController.updatepublicprofile);
userRoutes.post('/block', verifyAuth,blockUser, userController.blockuser);
userRoutes.get('/block', verifyAuth, userController.viewBlockUser);
userRoutes.post('/unblock', verifyAuth,unBlockUser, userController.unblockuser);
userRoutes.post('/report', verifyAuth,reportUser, userController.reportuser);
userRoutes.post('/inviteIncrementRequest', verifyAuth, userController.inviteIncrementRequest);
userRoutes.put('/status', verifyAuth, userController.updatestatus);
userRoutes.put('/updatePersonalInfo', verifyAuth, updatePersonalDetail, userController.updatePersonalInfo);
userRoutes.get('/getUserPersonalInfo',verifyAuth,verifyUserAuth,userController.getUserPersonalInfo);

userRoutes.post('/uploadimage', verifyAuth, uploadImage, userController.uploadImage);
userRoutes.post('/uploadterms', verifyAuth, termsImage, userController.uploadTermsImage);
userRoutes.post('/uploadPolicy', verifyAuth, policyUpload, userController.policyUpload);

//Applee routes
userRoutes.use('/apple/callback', userController.appleLogin);

//common
userRoutes.get('/verifyLatestTermsAndCondition', verifyAuth, userController.verifyLatestTermsAndCondition);
userRoutes.post('/acceptTermAndCondition', verifyAuth, userController.acceptTermsAndCondtion);

//Master Routes
userRoutes.get('/state/:value', userController.state);
userRoutes.get('/city/:value', userController.city);

//UserProfiles Routes
userRoutes.get('/userProfileDetails/:userId', verifyAuth,verifyUserAuth, userController.userProfileDetails)
userRoutes.get('/getUserProfilePicture', verifyAuth,verifyUserAuth, userController.userProfilePicture)
userRoutes.post('/fileUpload', verifyAuth,verifyUserAuth, uploadCommonFiles, userController.commonFileUpload);
userRoutes.put('/updateUserProfilePictiure', verifyAuth, updateProfilePicture,verifyUserAuth, userController.updateUserProfilePictiure);
userRoutes.put('/updateUserQuickBio', verifyAuth,updateUserQuickBio,verifyUserAuth, userController.updateUserQuickBio);
userRoutes.put('/updateUserSocialLink', verifyAuth,verifyUserAuth,userController.updateUserSocialLink);

userRoutes.put('/changePassword',changePassword, verifyAuth,verifyUserAuth, userController.changePassword);
userRoutes.delete('/deleteAccount',verifyAuth,verifyUserAuth,userController.deleteAccount);
//Feedback
userRoutes.post('/feedback', verifyAuth,verifyUserAuth, addFeedback, userController.userFeedback);

//For interservice communication
userRoutes.get('/userDetails/:userId',verifyInterServiceAuth, userController.userDetails);
userRoutes.get('/allUserDetails',verifyAuth, userController.allUserDetails);
userRoutes.post('/findBlockedUserList',verifyInterServiceAuth,userController.findBlockedUserList);
userRoutes.put('/updateUserSearchCount',verifyAuth,userController.updateUserSearchCount);
userRoutes.put('/updateUserHelpCount',verifyAuth,userController.updateUserHelpCount);
userRoutes.post('/sessionCalculation',verifyInterServiceAuth,userController.sessionCalculation);
userRoutes.post('/activeSeassionCalculationForFourteenDays',verifyInterServiceAuth,userController.activeSeassionCalculationForFourteenDays);
userRoutes.post('/activeSeassionCalculationForThirtyDays',verifyInterServiceAuth,userController.activeSeassionCalculationForThirtyDays);
userRoutes.get('/userMasterDetails/:userId',verifyInterServiceAuth, userController.userMasterDetails);



//For Terms and Policy
userRoutes.get('/getTerms',userController.getTerms);
userRoutes.get('/getPolicy',userController.getPolicy);

userRoutes.get('/getOverlayDetails',verifyAuth,verifyUserAuth,userController.getOverlayDetails);
userRoutes.put('/updateOverlayDetails',verifyAuth,verifyUserAuth,userController.updateOverlayDetails);

// chat
userRoutes.put('/updateLikes/:userId',verifyAuth,verifyUserAuth,userController.updateLikes);
userRoutes.get('/getLikes/:userId',verifyAuth,verifyUserAuth,userController.getLikeDetails);

//session
userRoutes.post('/sessionDetails',verifyAuth,verifyUserAuth,userController.sessionDetails);

userRoutes.post('/canada',userController.sync)
userRoutes.post('/US',userController.sync1)




module.exports = userRoutes;