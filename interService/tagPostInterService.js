const { newAxios, newAxiosWithoutAuth } = require('.'),
TAGPOST_SERVICE = process.env.TAGPOST_SERVICE;

class tagPostInterService {}


tagPostInterService.prototype.deleteAccount = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/deleteAccount`,
            method: "DELETE",
        });

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.updateUserPersonalInfo = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            data: {
                ...data
            },
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/updatePersonalInfo`,
            method: "PUT",
        });

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.userSinup = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            data: {
                ...data
            },
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/signup`,
            method: "POST",
        });

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.updateUserDetails = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            data: {
                ...data
            },
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/updateUserDetails`,
            method: "PUT",
        });

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.updateUserStatus = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            data: {
                ...data.body
            },
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/updateUserStatus/${data.status}`,
            method: "PUT",
        });  

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.addHistory = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/topic/addHistory`,
            method: "POST",
            data:{ 
                ...data
            }
        });

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.checkUser = async(req,res,data) =>{
    try{
        return await newAxios(req, res, {
            data: {
                ...data.body
            },
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/checkUserDetails/${parseInt(data.userId)}`,
            method: "GET",
        }); 

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.updateUserLikes = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/updateLikes/${data.userId}`,
            method: "PUT",
        }); 

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.userDislikes = async (req,res,data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/disLikes/${data.userId}`,
            method: "PUT",
        }); 

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}


tagPostInterService.prototype.findAllOpenQuestionDetail = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/findAOQDetails`,
            method: "GET",
            data: {
                ...data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.createQuestionStatusDetails = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/createQSDetails`,
            method: "PUT",
            data: {
                data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.updateQuestionDetails = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/updateQDetails`,
            method: "PUT",
            data: {
                ...data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}



tagPostInterService.prototype.particularUserTopicDetails = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/topic/topicDetails`,
            method: "GET",
            data: {
                ...data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.adminSUTopicDetails = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/topic/adminSTopicDetails`,
            method: "GET",
            data: {
                ...data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.adminAllOQDetails = async (req, res, data) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/getOpenQuestionDetails`,
            method: "GET",
            data: {
                ...data
            }
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.listOfHelpTopics = async (req, res) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/topic/listOfHelpTopics`,
            method: "GET",
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.listOfOpenQuestions = async (req, res) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/listOfOpenQuestions`,
            method: "GET",
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

tagPostInterService.prototype.directRequestDetails = async (req, res) =>{
    try{
        return await newAxios(req, res, {
            baseURL: TAGPOST_SERVICE,
            url: `/v1/post/directRequestDetails`,
            method: "GET",
        })

    }catch(err){
        console.log(err);
        if(err.response){
            return err.response;
        }
        return err;
    }
}

module.exports = new tagPostInterService()