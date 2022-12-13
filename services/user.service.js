const {
  userMaster,
  userDetail,
  terms,
  state,
  city,
  sociallink,
  waitlist,
  blockreport,
  help,
  impression,
  termsmaster,
  policymaster,
  feedbackdetail,
  likesDetails,
  session,
} = require("../models");
const { UserStatus, signUp, DR_STATUS } = require("../constants");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
var atob = require("atob");
const tagpostInterService = require("../interService/tagPostInterService");

const { getSingedUrl } = require("../middleware/multer");

class userService {}

userService.prototype.getUserId = async (req) => {
  var ca = req.headers["x-access-token"] || req.headers["authorization"];
  var base64Url = ca.split(".")[1];
  var decodedValue = JSON.parse(atob(base64Url));
  return decodedValue;
};

userService.prototype.createstate = async (payloads) => {
  payloads = { ...payloads, status: UserStatus.ACTIVE };
  return await state.create(payloads);
};

userService.prototype.createcity = async (payloads) => {
  payloads = { ...payloads, status: UserStatus.ACTIVE };
  return await city.create(payloads);
};

userService.prototype.createUserMaster = async (payloads) => {
  payloads = { ...payloads, status: UserStatus.ACTIVE };
  return await userMaster.create(payloads);
};

userService.prototype.createUserDetail = async (payloads) => {
  return await userDetail.create(payloads);
};

userService.prototype.createTermDetail = async (payloads) => {
  return await terms.create(payloads);
};

userService.prototype.createWaitlistDetail = async (payloads) => {
  return await waitlist.create(payloads);
};

userService.prototype.createBLockReportDetail = async (payloads) => {
  return await blockreport.create(payloads);
};

userService.prototype.createHelpKeywords = async (payloads) => {
  return await help.create(payloads);
};

userService.prototype.createHelpTopicDetail = async (payloads) => {
  return await topic.create(payloads);
};

userService.prototype.createOpenQuestionDetail = async (payloads) => {
  return await questions.create(payloads);
};

userService.prototype.createQuestionStatusDetails = async (payloads) => {
  return await questionstatus.bulkCreate(payloads);
};

userService.prototype.bulkOQHistoryCreation = async (payloads) => {
  return await questionstatus.create(payloads);
};

userService.prototype.createSocialLinks = async (payloads) => {
  return await sociallink.create(payloads);
};

userService.prototype.createQuestionImpressionDetails = async (payloads) => {
  return await impression.create(payloads);
};

userService.prototype.updateSocialLinks = async (payloads, where) => {
  return await sociallink.update(payloads, { where: where });
};

userService.prototype.updateUserMaster = async (payloads, where) => {
  return await userMaster.update(payloads, { where: where });
};

userService.prototype.updateUserDetail = async (payloads, where) => {
  return await userDetail.update(payloads, { where: where });
};

userService.prototype.updateTopicDetail = async (payloads, where) => {
  return await topic.update(payloads, { where: where });
};

userService.prototype.updateQuestionDetail = async (payloads, where) => {
  return await questions.update(payloads, { where: where });
};

userService.prototype.deleteHelpRecords = async (where) => {
  return await help.destroy({ where: where });
};

userService.prototype.unBLockReportUserDetail = async (where) => {
  return await blockreport.destroy({ where: where });
};

userService.prototype.findUser = async (find, raw = false) => {
  return await userMaster.findOne({
    where: {
      ...find,
    },
  });
};

userService.prototype.viewBlockUsers = async (find, raw = false) => {
  return await blockreport.findAll({
    where: {
      ...find,
    },
  });
};

userService.prototype.findOpenQuestionDetail = async (find, raw = false) => {
  return await questions.findOne({
    where: {
      ...find,
    },
  });
};

userService.prototype.findMyQuestionStatusDetail = async (
  find,
  raw = false
) => {
  console.log(find);
  return await questionstatus.findAll({
    where: {
      ...find,
    },
  });
};

userService.prototype.findImpressionDetail = async (find, raw = false) => {
  return await impression.findOne({
    where: {
      ...find,
    },
  });
};

userService.prototype.findProfile = async (find, raw = false) => {
  return await userDetail.findOne({
    where: {
      ...find,
    },
    attributes: [
      "userId",
      "userImage",
      "firstName",
      "lastName",
      "emailId",
      "country",
      "state",
      "abbrevation",
      "city",
      "likes",
      "helps",
      "userBio",
      "createdAt",
    ],
  });
};

userService.prototype.findProfilePicture = async (find, raw = false) => {
  return await userDetail
    .findOne({
      where: {
        ...find,
      },
      attributes: ["userId", "userImage"],
    })
    .then(async (result) => {
      result.dataValues.userImage = result.dataValues.userImage
        ? await getSingedUrl(result.dataValues.userImage)
        : null;
      return result;
    });
};

userService.prototype.findState = async (find, raw = false) => {
  return await state.findAll({
    where: {
      ...find,
    },
    attributes: ["value", "label", "abbrevation"],
  });
};

userService.prototype.findCity = async (find, raw = false) => {
  return await city.findAll({
    where: {
      ...find,
    },
    attributes: ["value", "label"],
  });
};

userService.prototype.findAdminUser = async (find, type, raw = false) => {
  return await userMaster.findOne({
    where: {
      ...find,
      ...type,
    },
  });
};

userService.prototype.isUser = async (find) => {
  return await userMaster.findOne({
    where: {
      ...find,
    },
  });
};

userService.prototype.checkExists = async (find) => {
  return await waitlist.count({
    where: {
      ...find,
    },
  });
};

userService.prototype.calculatesS6 = async (find) => {
  const findUserDetails = await userDetail.findOne({
    where: {
      ...find,
    },
    attributes: ["userId", "createdAt"],
  });

  let sinceStarted =
    (new Date().getTime() -
      new Date(findUserDetails.dataValues.createdAt).getTime()) /
    (1000 * 3600 * 24);

  if (sinceStarted < 7) {
    return { score: 27.5 };
  } else {
    const result = await session.findAll({
      where: {
        ...find,
        date: Sequelize.literal(
          `VNU23_SESSION_DATE >= DATE(NOW()) - INTERVAL 14 DAY`
        ),
      },
      attributes: [
        [Sequelize.fn("count", "VNU23_USER_SESSION_D"), "totalSession"],
      ],
    });
    let hoursValue = result[0].dataValues.totalSession
      ? parseInt(result[0].dataValues.totalSession)
      : 0;

    let s6;
    if (hoursValue >= 28) {
      s6 = 30;
    } else if (14 <= hoursValue && 27 >= hoursValue) {
      s6 = 29.5;
    } else if (10 <= hoursValue && 13 >= hoursValue) {
      s6 = 29;
    } else if (7 <= hoursValue && 9 >= hoursValue) {
      s6 = 27.5;
    } else if (5 <= hoursValue && 6 >= hoursValue) {
      s6 = 25;
    } else if (3 <= hoursValue && 4 >= hoursValue) {
      s6 = 23;
    } else if (1 <= hoursValue && 2 >= hoursValue) {
      s6 = 20;
    } else {
      s6 = 0;
    }

    return { score: s6 };
  }
};

userService.prototype.findUserProfile = async (req, res) => {
  let find = { userId: req.params.userId };
  return await userDetail
    .findOne({
      where: {
        ...find,
      },
      attributes: [
        "userId",
        "userImage",
        "firstName",
        "lastName",
        "emailId",
        "country",
        "state",
        "abbrevation",
        "city",
        "likes",
        "helps",
        "userBio",
        "refferedBy",
        "refferedDate",
        "createdAt",
      ],
      order: [
        // [ {model: userDetail}, 'detailId', 'desc'  ],
        [{ model: "linkDetails" }, "VNU13_DETAIL_ID_D", "asc"],
      ],
      include: [
        {
          model: sociallink,
          as: "linkDetails",
          attributes: ["detailId", "socialLinkName", "socialLink"],
        },
      ],
    })
    .then(async (result) => {
      let { data } = await tagpostInterService.particularUserTopicDetails(
        req,
        res,
        find
      );
      let topicdetails = data.data;

      let referredUserDetails = await userDetail
        .findOne({
          where: {
            userId: result.refferedBy,
          },
          attributes: [
            "userId",
            "userImage",
            "firstName",
            "lastName",
            "emailId",
          ],
        })
        .then(async (referredUser) => {
          if (referredUser) {
            referredUser.dataValues.userImage = referredUser.dataValues
              .userImage
              ? await getSingedUrl(referredUser.dataValues.userImage)
              : null;
          }

          return referredUser;
        });

      console.log("referredUserDetails", referredUserDetails);

      result.dataValues.userImage = result.dataValues.userImage
        ? await getSingedUrl(result.dataValues.userImage)
        : null;
      result.dataValues.topicDetails = topicdetails;
      result.dataValues.referredUserDetail = referredUserDetails;
      //   result.dataValues.referredUserDetail.refferedDate = result.dataValues.refferedDate
      return result;
    });
};

userService.prototype.findLatestAcceptedTerms = async (find, raw = false) => {
  return await terms.findOne({
    where: {
      ...find,
      [Op.and]: [
        {
          $VNU03_TERMS_MASTER_ID$: {
            [Op.not]: null,
          },
        },
      ],
    },
    order: [["createdAt", "DESC"]],
  });
};

userService.prototype.updatedTermsAndCondition = async (find, raw = false) => {
  return await termsmaster
    .findOne({
      where: {
        ...find,
      },
      order: [["createdAt", "DESC"]],
    })
    .then(async (termsList) => {
      termsList.dataValues.terms = await getSingedUrl(
        termsList.dataValues.terms
      );

      return termsList;
    });
};
userService.prototype.updateUserProfile = async (payloads, where) => {
  return await userDetail.update(payloads, { where: where });
};
userService.prototype.updateUserBio = async (payloads, where) => {
  return await userDetail.update(payloads, { where: where });
};
userService.prototype.updateUserTopic = async (payloads, where) => {
  console.log(payloads, where);
  return await topic.update(payloads, { where: where });
};

userService.prototype.existHelpTopicChecking = async (requestData) => {
  console.log(requestData);
  return await topic.findOne({
    where: {
      [Op.and]: [
        {
          $VNU08_TOPIC_NAME_X$: requestData.topicName,
          $VNU08_USER_ID_D$: requestData.userId,
          $VNU08_STATUS_D$: 1,
          $VNU08_TOPIC_ID_D$: {
            [Op.ne]: requestData.topicId,
          },
        },
      ],
    },
  });
};

userService.prototype.deleteUserSocialLink = async (where) => {
  return await sociallink.destroy({ where: where });
};
userService.prototype.createUserSocialLink = async (payloads) => {
  return await sociallink.bulkCreate(payloads);
};

userService.prototype.userBasicInformation = async (req, res) => {
  let find = { userId: req.params.userId };
  return await userDetail
    .findOne({
      where: {
        ...find,
      },
      attributes: [
        "userId",
        "userImage",
        "firstName",
        "lastName",
        "emailId",
        "country",
        "state",
        "abbrevation",
        "city",
        "likes",
        "helps",
        "userBio",
        "createdAt",
      ],
    })
    .then(async (result) => {
      result.dataValues.userImage = result.dataValues.userImage
        ? await getSingedUrl(result.dataValues.userImage)
        : null;
      return result;
    });
};
userService.prototype.allUserBasicInformation = async (req, res) => {
  return await userDetail
    .findAll({
      attributes: ["userId", "firstName", "lastName", "emailId"],
    })
    .then(async (result) => {
      return result;
    });
};
userService.prototype.createFeedback = async (payloads) => {
  return await feedbackdetail.create(payloads);
};
userService.prototype.getUserPassword = async (payload) => {
  let find = { userId: payload.userId };
  return await userMaster
    .findOne({
      where: {
        ...find,
      },
      attributes: ["VNU01_PASSWORD_X"],
    })
    .then((res) => {
      return res.dataValues["VNU01_PASSWORD_X"];
    });
};

userService.prototype.findUserDetail = async (find, raw = false) => {
  return await userDetail
    .findOne({
      where: {
        ...find,
      },
      attributes: [
        "userId",
        "userImage",
        "firstName",
        "lastName",
        "emailId",
        "country",
        "state",
        "abbrevation",
        "city",
        "likes",
        "helps",
        "userBio",
        "createdAt",
        "signupStatus",
      ],
    })
    .then(async (userDetails) => {
      userDetails.dataValues.userImage = userDetails.dataValues.userImage
        ? await getSingedUrl(userDetails.dataValues.userImage)
        : null;
      return userDetails;
    });
};

userService.prototype.getLatestTerms = async () => {
  return await termsmaster
    .findAll({
      limit: 1,
      order: [["VNU19_CREATED_AT", "DESC"]],
    })
    .then((data) => {
      return data;
    });
};

userService.prototype.getLatestPolicy = async () => {
  return await policymaster
    .findAll({
      limit: 1,
      order: [["VNU20_CREATED_AT", "DESC"]],
    })
    .then((data) => {
      return data;
    });
};

userService.prototype.findOverlayDetails = async (find) => {
  return await userMaster.findOne({
    where: {
      ...find,
    },
    attributes: ["userId", "firstTimeUser"],
  });
};

userService.prototype.updateLikes = async (where) => {
  return await userDetail.update(
    { likes: Sequelize.literal("VNU02_LIKES_COUNT_D + 1") },
    { where: where }
  );
};

userService.prototype.createLikes = async (payloads) => {
  return await likesDetails.create(payloads);
};

userService.prototype.changeLikes = async (status, where) => {
  return await likesDetails.update({ status: status }, { where: where });
};

userService.prototype.disLikes = async (where) => {
  return await userDetail.update(
    { likes: Sequelize.literal("VNU02_LIKES_COUNT_D - 1") },
    { where: where }
  );
};

userService.prototype.getlikes = async (payloads) => {
  return await likesDetails.findOne({
    where: {
      [Op.and]: {
        userId: payloads.userId,
        likeBy: payloads.likeBy,
      },
    },
  });
};
userService.prototype.createSessionDetails = async (payloads) => {
  return await session.bulkCreate(payloads);
};
userService.prototype.activeSessionCalculationFor14Days = async (find) => {
  const result = await session.findAll({
    where: {
      ...find,
      date: Sequelize.literal(
        `VNU23_SESSION_DATE >= DATE(NOW()) - INTERVAL 14 DAY`
      ),
    },
    attributes: [
      [Sequelize.fn("count", "VNU23_USER_SESSION_D"), "totalSession"],
    ],
  });

  return { hours: parseInt(result[0].dataValues.totalSession) };
};

userService.prototype.activeSessionCalculationFor30Days = async (find) => {
  const result = await session.findAll({
    where: {
      ...find,
      date: Sequelize.literal(
        `VNU23_SESSION_DATE >= DATE(NOW()) - INTERVAL 30 DAY`
      ),
    },
    attributes: [
      [Sequelize.fn("count", "VNU23_USER_SESSION_D"), "totalSession"],
    ],
  });

  return { hours: parseInt(result[0].dataValues.totalSession) };
};

userService.prototype.uniqueImpressionCount = async (find, raw = false) => {
  return await impression
    .findOne({
      where: {
        ...find,
      },
      attributes: [
        [
          Sequelize.fn("count", "VNU18_IMPRESSION_ID_D"),
          "uniqueImpressionCount",
        ],
      ],
    })
    .then((result) => {
      return { count: result.dataValues.uniqueImpressionCount };
    });
};

module.exports = new userService();
