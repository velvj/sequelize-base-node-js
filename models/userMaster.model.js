const { UserRole, BooleanType ,SocialLoginType} = require('../constants');
const bcrypt = require('bcrypt');
const aesCipher = require('../utils/cipher')
module.exports = (sequelize, DataTypes) => {
	const userMaster = sequelize.define(
		"VNU01_USER_MASTER",
		{
			userId: { type: DataTypes.INTEGER, primaryKey: true, field: 'VNU01_USER_MASTER_D', autoIncrement: true },
			firstName: { type: DataTypes.STRING, field: 'VNU01_FIRST_NAME_N' },
			lastName: { type: DataTypes.STRING, field: 'VNU01_LAST_NAME_N' },
			emailId: {
				type: DataTypes.STRING,
				unique: true,
				field: 'VNU01_EMAIL_X',
				allowNull: false
			},
			password: { type: DataTypes.STRING, field: 'VNU01_PASSWORD_X' },
			signUpStatus: { type: DataTypes.INTEGER, field: 'VNU01_SIGNUP_STATUS' },
			emailVerifyCode: { type: DataTypes.INTEGER, field: 'VNU02_EMAIL_VERIFY_CODE_D' },
			forgetPasswordCode: {
				type: DataTypes.INTEGER,
				field: 'VNU01_FORGET_PASSWORD_CODE_D'
			  },
			signupId: { type: DataTypes.INTEGER, field: 'VNU01_SIGNUP_TYPE_D' },
			typeId: { type: DataTypes.INTEGER, field: 'VNU01_TYPE_D', defaultValue: UserRole.END_USER },
			status: { type: DataTypes.INTEGER, field: 'VNU01_STATUS_D' },
			firstTimeUser: { type: DataTypes.BOOLEAN, field: 'VNU01_FIRST_TIME_USER' },
			isSocialLogin: {type: DataTypes.BOOLEAN,field: 'VNU01_IS_SOCIAL_LOGIN',defaultValue:BooleanType.NO },  
			socialLoginType: {type: DataTypes.INTEGER,field: 'VNU01_SOCIAL_LOGIN_TYPE_D',defaultValue: SocialLoginType.NORMAL},  
			socialLoginCode: {type: DataTypes.STRING,field: 'VNU01_SOCIAL_LOGIN_CODE_D'}, 
            statusBasedKey:{type: DataTypes.STRING,field:'VNU01_STATUSBASED_KEY'},
			createdBy: { type: DataTypes.INTEGER, field: 'VNU01_CREATED_D' },
			updatedBy: { type: DataTypes.INTEGER, field: 'VNU01_UPDATED_D' },
			createdAt: { type: DataTypes.DATE, field: 'VNU01_CREATED_AT' },
			updatedAt: { type: DataTypes.DATE, field: 'VNU01_UPDATED_AT' },
			token: { type: DataTypes.STRING, field: 'VNU01_AUTH_TOKEN' },
		},
		{
			freezeTableName: true,
			indexes: [
				{
					unique: true,
					fields: ['userId', 'emailId']
				}
			]
		}
	);

	function generateHash(user) {
		if (user === null) {
			throw new Error('No found employee');
		}
		else if (!user.changed('password')) return user.password;
		else {
			let salt = bcrypt.genSaltSync(8);
			return user.password = bcrypt.hashSync(user.password, salt);
		}
	}

	userMaster.prototype.validPassword = async function (password, oldPassword) {
		let decrptPass = aesCipher.aesDecrpt(password)
		// decrptPass = generateHash({ password: decrptPass })
		return bcrypt.compare(decrptPass, oldPassword);
	}
	userMaster.prototype.generateHash = async function (password) {
		if (password) {
			let salt = bcrypt.genSaltSync(8);
			return bcrypt.hashSync(password, salt);
		}
	}

	userMaster.beforeCreate(generateHash);
	userMaster.beforeUpdate(generateHash);

	userMaster.associate = function (models) {
		userMaster.hasOne(models.userDetail, {
			foreignKey: 'userId',
			as: 'userDetail'
		});
	};

	return userMaster;
};
