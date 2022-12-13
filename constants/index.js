const UserRole = {
	ADMIN_R: 1,
	END_USER: 2,
}
const Gender = {
	MALE: 1,
	FEMALE: 2
}

const UserStatus = {
	FIRST_TIME: 11,
	ACTIVE: 1,
	INACTIVE: 4,
}

const user = {
	BLOCKED: 1,
	REPORTED: 2,
}

const TermsType = {
	SignUp: 1,
	PELoginNDING: 2
	
}

const SocialLoginType = { 
	NORMAL:1,
	GOOGLE:2,
	APPLE:3 
}

const Experience = { 
	BASIC:1,
	INTERMEDIATE:2,
	ADVANCED:3,
	PROFESSIONAL:4 
}

const Question = { 
	ACTIVE:1,
	CLOSED:2,
	DELETED:3,
}

const SignUpStatus = {
	CREATE_ACCOUNT:0,
	EMAIL_VERIFY: 1,
	TERMS_AND_CONDITIONS: 2,
	BASIC_PROFILE: 3,
	GET_HELP: 5,
	OFFER_HELP: 6,
	SETUP_HELP_PROVIDER:4
}

const EmailStatus = {
	VERIFIED: 2,
	PENDING: 3
}

const BooleanType = {
	YES: 1,
	NO: 0
}

const RefferalStatus = {
	UNUSED: 0,
	USED: 1
}

const DR_STATUS = { 
	CREATED:1,
	RESPONDED:2,
	DISMISSED:3,
	EXPIRED:4 
}

const DIMENSIONS = {
	CM: 3,
	FEET: 4,
	INCH : 5
}
const DELETE_STATUS = {
    DELETED: 1,
    NOT_DELETED: 0,
};
const SORTBY = {
    DESC: "desc",
    ASC: "asc",
};
const PAGESTATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

const signUp = {
    ACTIVE: 1,
    INACTIVE: 0,
	DELETE:2,
	SUSPEND:3
};

const SIZING_DETAILS_TYPE = {
	'SIZINGONE': 1, 'SIZINGTWO': 2, 'SIZINGTHREE': 3
};

module.exports = Object.freeze({
	UserRole,
	Gender,
	DIMENSIONS,
	UserStatus,
	SignUpStatus,
	EmailStatus,
	BooleanType,
	DELETE_STATUS,
	SORTBY,
	SIZING_DETAILS_TYPE,
	PAGESTATUS,
	TermsType,
	SocialLoginType,
	Experience,
	RefferalStatus,
	user,
	signUp,
	DR_STATUS,
	Question
})