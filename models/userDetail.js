module.exports = (sequelize, DataTypes) => {
    const userDetail = sequelize.define(
        "VNU02_USER_DETAIL",
        {
            detailId: { type: DataTypes.INTEGER, primaryKey: true, field: 'VNU02_DETAIL_D', autoIncrement: true },
            userId: { type: DataTypes.INTEGER, field: 'VNU02_USER_MASTER_D', unique: true },
            emailStatus: { type: DataTypes.INTEGER, field: 'VNU02_EMAIL_STATUS_D' },
            signupStatus: { type: DataTypes.INTEGER, field: 'VNU02_SIGNUP_STATUS_D' },
            termsType: { type: DataTypes.INTEGER, field: 'VNU02_TERMS_TYPE_D' },
            userImage: { type: DataTypes.STRING, field: 'VNU02_USER_IMAGE_X'},
            firstName: { type: DataTypes.STRING, field: 'VNU02_FIRST_NAME_N' },
            lastName: { type: DataTypes.STRING, field: 'VNU02_LAST_NAME_N' },
            emailId: {
				type: DataTypes.STRING,
				unique: true,
				field: 'VNU02_EMAIL_X',
				allowNull: false
			},
            country: { type: DataTypes.STRING, field: 'VNU02_COUNTRY_X' },
            state: { type: DataTypes.STRING, field: 'VNU02_STATE_X' },
            abbrevation:{type: DataTypes.STRING, field:'VNU02_STATE_X_ABBREVATION'},
            city: { type: DataTypes.STRING, field: 'VNU02_CITY_X' },
            likes: {
                type: DataTypes.INTEGER,
                field: 'VNU02_LIKES_COUNT_D'
            },
            helps: {
                type: DataTypes.INTEGER,
                field: 'VNU02_HELPED_COUNT_D'
            },
            socialLinks: { 
                type: DataTypes.STRING, 
                field: 'VNU02_SOCIAL_LINKS_X',
            },
            userBio: {
                type: DataTypes.STRING,
                field: 'VNU02_USER_BIO_X'
            },
            topicName: {
                type: DataTypes.STRING,
                field: 'VNU02_TOPIC_NAME_X'
            },
            userExperience: {
                type: DataTypes.STRING,
                field: 'VNU02_USER_EXPERIENCE_X'
            },
            helpKeywords: { 
                type: DataTypes.STRING, 
                field: 'VNU02_HELP_KEYWORDS_X',
            },
            refferedBy: {
                type: DataTypes.STRING,
                field: 'VNU02_REFFERED_BY_X',
            },
            refferalCode: {
                type: DataTypes.STRING,
                field: 'VNU02_REFFERAL_CODE_X',
            },
            searchCount: {
                type: DataTypes.INTEGER,
                field: 'VNU02_SEARCH_COUNT',
            },
            refferedDate:{ type: DataTypes.DATE, field: 'VNU02_REFERRED_AT'},
			status: { type: DataTypes.INTEGER, field: 'VNU02_STATUS_D' },        
            createdBy: { type: DataTypes.INTEGER, field: 'VNU02_CREATED_D' },
            updatedBy: { type: DataTypes.INTEGER, field: 'VNU02_UPDATED_D' },
            createdAt: { type: DataTypes.DATE, field: 'VNU02_CREATED_AT' },
			updatedAt: { type: DataTypes.DATE, field: 'VNU02_UPDATED_AT' }
        },
        {
            freezeTableName: true,
        }
    );


    userDetail.associate = function (models) {

        userDetail.hasMany(models.sociallink, {
            foreignKey: 'userId',
            sourceKey:'userId',
            as: 'linkDetails'
        });
	};

    return userDetail;
};
