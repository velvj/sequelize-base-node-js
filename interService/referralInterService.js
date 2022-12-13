const { newAxios, newAxiosWithoutAuth} = require('.'),
REFERRAL_SERVICE = process.env.REFERRAL_SERVICE;

class ReferralInterService {}


ReferralInterService.prototype.updatereferralService = async (req, res, data) => {
    try {
       
        return await newAxios(req,res, {
            baseURL: REFERRAL_SERVICE,
            url: `/v1/referral/updateReferralDetails`,
            method: "PUT",
            data : {
                ...data
            }
        });
    } catch (error) {
        return { error: true,status:422, message: error }
    }
}


ReferralInterService.prototype.referralDataVerification = async (req, res, data) => {
    try {       
        let result = await newAxiosWithoutAuth(req,res, {
            baseURL: REFERRAL_SERVICE,
            url: `/v1/referral/findReferralData/${data.referralCode}`,
            method: "GET",
            data : {
                ...data
            }
        });
        return result.data;
    } catch (error) {
        return { error: true,status:422, message: error }
    }
}

ReferralInterService.prototype.userGenerrateReferralCode = async (req, res, data) => {
    try {
       
        let result = await newAxios(req,res, {
            baseURL: REFERRAL_SERVICE,
            url: `/v1/referral/userGenerrateReferralCode`,
            method: "POST",
            data : {
                ...data
            }
        });
        return result.data;
    } catch (error) {
        return { error: true,status:422, message: error }
    }
}

ReferralInterService.prototype.getReferralData = async (req, res) => {
    try {
       
        let result = await newAxiosWithoutAuth(req,res, {
            baseURL: REFERRAL_SERVICE,
            url: `/v1/referral/getReferralData`,
            method: "GET"
        });
        return result.data.data;
    } catch (error) {
        return { error: true,status:422, message: error }
    }
}

module.exports = new ReferralInterService()