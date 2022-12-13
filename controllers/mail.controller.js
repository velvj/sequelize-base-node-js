const { SignUpStatus, UserRole, UserStatus } = require("../constants");

const nodemailer = require("nodemailer");
const mailerhbs = require("nodemailer-express-handlebars");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")



const transport = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    secureConnection: false,
    logger: false,
    debug: true,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
}, {
    from: `${process.env.SMTP_FROM}`
});

let options1 = {
    viewEngine: {
        extname: '.html',
        layoutsDir: './utils/templates/emails',
        partialsDir: './utils/templates/emails', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'utils/templates/emails',
    extName: '.html'
};
let options2 = {
    viewEngine: {
        extname: '.html',
        layoutsDir: './utils/templates/emails',
        partialsDir: './utils/templates/emails', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'utils/templates/emails',
    extName: '.html'
};
let options3 = {
    viewEngine: {
        extname: '.html',
        layoutsDir: './utils/templates/emails',
        partialsDir: './utils/templates/emails', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'utils/templates/emails',
    extName: '.html'
};

const sendVerifyMail = async (to, subject, html, context) => {
    let html1='<!DOCTYPE html>\n'
    html1+='<html lang="en">\n'
  
  
    html1+=' <head>\n'
    html1+=' <title></title>\n'
    html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
    html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
    html1+='<meta name="format-detection" content="telephone=no" />\n'
    html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
    html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
    html1+=' </head>\n'
 
    html1+=' <body>\n'
    html1+='  <div style="height: 100%">\n'
    html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
    html1+='   <div\n'
    html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
    html1+='   <div style="text-align: left;">\n'
    html1+='    <p>Hi '+context.firstName+',</p>\n'
    html1+='    <p>Thank you for joining the Venn community! Please use the following code to verify your email.</p>\n'

    html1+='   <h2 style="letter-spacing: 7px;">'+context.code+'</h2>\n'

    html1+='  <p>Thanks,</p>\n'
    html1+='         <p style="margin-top: -15px;">The Venn Team</p>\n'
    html1+='   <img style="height: 68px;width: 80px" src="http://localhost:2331/public/logo.png">\n'
    html1+='        </div><br>\n'
    html1+='         <p style="margin-top: -15px;color:#808080">If you did not sign up for a Venn account using this email address, please reply to this email and let us know.</p>\n'
    html1+='      </div>\n'
    html1+='       </div>\n'
    html1+='    </table>\n'
    html1+='  </div>\n'
    html1+=' </body>\n'
  
    html1+='  </html>\n'

    if (process.env.SMTP_ENABLED) {
        if (context) {

            const msg = {
                to: to, // Change to your recipient
                from: process.env.sendgrid_sender, // Change to your verified sender
                subject: subject,
                html: html1,
              }

            return  sgMail
            .send(msg)
            .then((response) => {
              console.log(response[0].statusCode)
            })
            .catch((error) => {
              console.error(error)
            })
        } 
    }
};

const sendForgetMail = async (to, subject, html, context) => {

    let html1='<!DOCTYPE html>\n'
    html1+='<html lang="en">\n'
  
  
    html1+=' <head>\n'
    html1+=' <title></title>\n'
    html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
    html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
    html1+='<meta name="format-detection" content="telephone=no" />\n'
    html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
    html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
    html1+=' </head>\n'
 
    html1+=' <body>\n'
    html1+='  <div style="height: 100%">\n'
    html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
    html1+='   <div\n'
    html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
    html1+='        <div style="text-align: left;">\n'
    html1+='    <p>Hi '+context.firstName+',</p>\n'
    html1+='       <p>You recently requested a password reset for your Venn account. To complete the process, please use the following code to verify your email.</p>\n'
    html1+='   <h2 style="letter-spacing: 7px;">'+context.code+'</h2>\n'
    html1+='         <p>Thanks,</p>\n'
    html1+='         <p style="margin-top: -15px;">The Venn Team</p>\n'
    html1+='        </div><br>\n'
    html1+='         <p style="margin-top: -15px;color:#808080">You received this email because you recently requested a password reset for your Venn account. If you did not make this request or if you believe an unauthorized person has accessed your account, please sign into your Venn app and reset your password immediately.</p>\n'
    html1+='      </div>\n'
    html1+='       </div>\n'
    html1+='    </table>\n'
    html1+='  </div>\n'
    html1+=' </body>\n'
  
    html1+='  </html>\n'

    if (process.env.SMTP_ENABLED) {
        if (context) {
           
            const msg = {
                to: to, // Change to your recipient
                from: process.env.sendgrid_sender, // Change to your verified sender
                subject: subject,
                html: html1,
              }

            return  sgMail
            .send(msg)
            .then((response) => {
              console.log(response[0].statusCode)
            })
            .catch((error) => {
              console.error(error)
            })
        } 
    }
};

const adminDeleteuserAccountMail = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
  html1+='<html lang="en">\n'


  html1+=' <head>\n'
  html1+=' <title></title>\n'
  html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
  html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
  html1+='<meta name="format-detection" content="telephone=no" />\n'
  html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
  html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
  html1+=' </head>\n'

  html1+=' <body>\n'
  html1+='  <div style="height: 100%">\n'
  html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
  html1+='   <div\n'
  html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
  html1+='        <div style="text-align: left;">\n'
  html1+='    <p>Hi '+context.firstName+',</p>\n'
  html1+='       <p>Your Venn account has been deleted. Please contact support@getvenn.com if you have any questions.</p>\n'
  html1+='         <p>Thanks,</p>\n'
  html1+='         <p>The Venn Team</p>\n'
  html1+='        </div><br>\n'
  html1+='      </div>\n'
  html1+='       </div>\n'
  html1+='    </table>\n'
  html1+='  </div>\n'
  html1+=' </body>\n'

  html1+='  </html>\n'

  if (process.env.SMTP_ENABLED) {
      if (context) {
         
          const msg = {
              to: to, // Change to your recipient
              from: process.env.sendgrid_sender, // Change to your verified sender
              subject: subject,
              html: html1,
            }

          return  sgMail
          .send(msg)
          .then((response) => {
            console.log(response[0].statusCode)
          })
          .catch((error) => {
            console.error(error)
          })
      } 
  }
};


const userDeleteAccountMail = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
  html1+='<html lang="en">\n'


  html1+=' <head>\n'
  html1+=' <title></title>\n'
  html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
  html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
  html1+='<meta name="format-detection" content="telephone=no" />\n'
  html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
  html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
  html1+=' </head>\n'

  html1+=' <body>\n'
  html1+='  <div style="height: 100%">\n'
  html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
  html1+='   <div\n'
  html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
  html1+='        <div style="text-align: left;">\n'
  html1+='    <p>Hi '+context.firstName+',</p>\n'
  html1+='       <p>You have successfully deleted your Venn account. We are sad to see you go!</p>\n'
  html1+='       <p>If you have any feedback for us, please reply to this email and let us know.</p>\n'
  html1+='         <p>Thanks,</p>\n'
  html1+='         <p>The Venn Team</p>\n'
  html1+='        </div><br>\n'
  html1+='         <p style="margin-top: -15px;color:#808080">You received this email because you recently deleted your Venn account. If you did not perform this action, please reply to this email and let us know.</p>\n'
  html1+='      </div>\n'
  html1+='        </div><br>\n'
  html1+='      </div>\n'
  html1+='       </div>\n'
  html1+='    </table>\n'
  html1+='  </div>\n'
  html1+=' </body>\n'
  html1+='  </html>\n'

  if (process.env.SMTP_ENABLED) {
      if (context) {
         
          const msg = {
              to: to, // Change to your recipient
              from: process.env.sendgrid_sender, // Change to your verified sender
              subject: subject,
              html: html1,
            }

          return  sgMail
          .send(msg)
          .then((response) => {
            console.log(response[0].statusCode)
          })
          .catch((error) => {
            console.error(error)
          })
      } 
  }
};

const sendWaitlistMail = async (to, subject, html, context) => {

    let html1='<!DOCTYPE html>\n'
    html1+='<html lang="en">\n'
  
  
    html1+=' <head>\n'
    html1+=' <title></title>\n'
    html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
    html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
    html1+='<meta name="format-detection" content="telephone=no" />\n'
    html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
    html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
    html1+=' </head>\n'
 
    html1+=' <body>\n'
    html1+='  <div style="height: 100%">\n'
    html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
    html1+='   <div\n'
    html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
    html1+='        <div style="text-align: left;">\n'
    html1+='    <p>A waitlist request has been received from:</p>\n'
    html1+='   <p>First Name:  '+context.firstName+'</p>\n'
    html1+='   <p>Last Name:  '+context.lastName+'</p>\n'
    html1+='   <p>Email: '+context.email+'</p>\n'
    html1+='        </div>\n'
    html1+='      </div>\n'
    html1+='       </div>\n'
    html1+='    </table>\n'
    html1+='  </div>\n'
    html1+=' </body>\n'
  
    html1+='  </html>\n'
    if (process.env.SMTP_ENABLED) {
        if (context) {
            to.forEach((val,i)=>{
              const msg = {
                  to: val, // Change to your recipient
                  from: process.env.sendgrid_sender, // Change to your verified sender
                  subject: subject,
                  html: html1,
                }
    
              return  sgMail
              .send(msg)
              .then((response) => {
                console.log(response[0].statusCode)
              })
              .catch((error) => {
                console.error(error)
              })
            })
        } 
    }
};


const sendReportMail = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
  html1+='<html lang="en">\n'


  html1+=' <head>\n'
  html1+=' <title></title>\n'
  html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
  html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
  html1+='<meta name="format-detection" content="telephone=no" />\n'
  html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
  html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
  html1+=' </head>\n'

  html1+=' <body>\n'
  html1+='  <div style="height: 100%">\n'
  html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
  html1+='   <div\n'
  html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'        
  html1+='        <div">\n'
  html1+='    <p style="text-decoration: underline;">Reporting User</p>\n'
  html1+='   <p>First Name:  '+context.reportingUserFirstName+'</p>\n'
  html1+='   <p>Last Name:  '+context.reportingUserLastName+'</p>\n'
  html1+='   <p>Email: '+context.reportingUserEmail+'</p>\n'
  html1+='    <p style="text-decoration: underline;">Reported User</p>\n'
  html1+='   <p>First Name:  '+context.reportedUserFirstName+'</p>\n'
  html1+='   <p>Last Name:  '+context.reportedUserLastName+'</p>\n'
  html1+='   <p>Email: '+context.reportedUserEmail+'</p>\n'
  html1+='    <p style="text-decoration: underline;">Report Details</p>\n'
  html1+='   <p>'+context.reason+'</p>\n'
  html1+='        </div">\n'

  html1+='        <div style="text-align: left;">\n'
  html1+='        </div>\n'
  html1+='      </div>\n'
  html1+='       </div>\n'
  html1+='    </table>\n'
  html1+='  </div>\n'
  html1+=' </body>\n'

  html1+='  </html>\n'
  if (process.env.SMTP_ENABLED) {
      if (context) {
         to.forEach((val,i)=>{
           
           const msg = {
               to: val, // Change to your recipient
               from: process.env.sendgrid_sender, // Change to your verified sender
               subject: subject,
               html: html1,
             }
 
           return  sgMail
           .send(msg)
           .then((response) => {
             console.log(response[0].statusCode)
           })
           .catch((error) => {
             console.error(error)
           })
         })
      } 
  }
};


const sendInviteRequest = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
  html1+='<html lang="en">\n'


  html1+=' <head>\n'
  html1+=' <title></title>\n'
  html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
  html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
  html1+='<meta name="format-detection" content="telephone=no" />\n'
  html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
  html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
  html1+=' </head>\n'

  html1+=' <body>\n'
  html1+='  <div style="height: 100%">\n'
  html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
  html1+='   <div\n'
  html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'        
  html1+='        <div">\n'
  html1+='    <p style="text-decoration: underline;">Referral Codes Request</p>\n'
  html1+='   <p>First Name:  '+context.userFirstName+'</p>\n'
  html1+='   <p>Last Name:  '+context.userLastName+'</p>\n'
  html1+='   <p>User ID: '+context.userId+'</p>\n'
  html1+='   <p>Email: '+context.userEmail+'</p>\n'
  html1+='        </div">\n'

  html1+='        <div style="text-align: left;">\n'
  html1+='        </div>\n'
  html1+='      </div>\n'
  html1+='       </div>\n'
  html1+='    </table>\n'
  html1+='  </div>\n'
  html1+=' </body>\n'

  html1+='  </html>\n'
  if (process.env.SMTP_ENABLED) {
      if (context) {
         to.forEach((val,i)=>{
           
           const msg = {
               to: val, // Change to your recipient
               from: process.env.sendgrid_sender, // Change to your verified sender
               subject: subject,
               html: html1,
             }
 
           return  sgMail
           .send(msg)
           .then((response) => {
             console.log(response[0].statusCode)
           })
           .catch((error) => {
             console.error(error)
           })
         })
      } 
  }
};


const feedbackMail = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
  html1+='<html lang="en">\n'


  html1+=' <head>\n'
  html1+=' <title></title>\n'
  html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
  html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
  html1+='<meta name="format-detection" content="telephone=no" />\n'
  html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
  html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
  html1+=' </head>\n'

  html1+=' <body>\n'
  html1+='  <div style="height: 100%">\n'
  html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
  html1+='   <div\n'
  html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'
      
  html1+='        <div">\n'
  html1+='    <p style="text-decoration: underline;">Submitting User</p>\n'
  html1+='   <p>First Name:  '+context.firstName+'</p>\n'
  html1+='   <p>Last Name:  '+context.lastName+'</p>\n'
  html1+='   <p>Email: '+context.emailId+'</p>\n'
  html1+='    <p style="text-decoration: underline;">Feedback Details</p>\n'
  html1+='   <p>'+context.reason+'</p>\n'
  html1+='        </div">\n'

  html1+='        <div style="text-align: left;">\n'
  html1+='        </div>\n'
  html1+='      </div>\n'
  html1+='       </div>\n'
  html1+='    </table>\n'
  html1+='  </div>\n'
  html1+=' </body>\n'

  html1+='  </html>\n'
  if (process.env.SMTP_ENABLED) {
      if (context) {
         to.forEach((val,i)=>{
           
           const msg = {
               to: val, // Change to your recipient
               from: process.env.sendgrid_sender, // Change to your verified sender
               subject: subject,
               html: html1,
             }
 
           return  sgMail
           .send(msg)
           .then((response) => {
             console.log(response[0].statusCode)
           })
           .catch((error) => {
             console.error(error)
           })
         })
      } 
  }
};

const passwordChangeConfirmation = async (to, subject, html, context) => {

  let html1='<!DOCTYPE html>\n'
    html1+='<html lang="en">\n'
  
  
    html1+=' <head>\n'
    html1+=' <title></title>\n'
    html1+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n'
    html1+='<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />\n'
    html1+='<meta name="format-detection" content="telephone=no" />\n'
    html1+='<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;" />\n'
    html1+=' <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />\n'
    html1+=' </head>\n'
 
    html1+=' <body>\n'
    html1+='  <div style="height: 100%">\n'
    html1+='  <table align="center" border="0" cellpadding="0" cellspacing="0" width="90%" style="border-collapse: collapse">\n'
    html1+='   <div\n'
    html1+='     style="width: 45%;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-family: "Roboto", sans-serif;">\n'

    html1+='        <div style="text-align: left;">\n'
    html1+='    <p>Hi '+context.firstName+',</p>\n'
    html1+='       <p>Your Venn password has been successfully changed.</p>\n'
    html1+='       <p>If you did not change your password, please email us at support@getvenn.com with your registered email for assistance.</p>\n'
    html1+='         <p>Thanks,</p>\n'
    html1+='         <p style="margin-top: -15px;">The Venn Team</p>\n'
    html1+='        </div>\n'
    html1+='      </div>\n'
    html1+='       </div>\n'
    html1+='    </table>\n'
    html1+='  </div>\n'
    html1+=' </body>\n'
  
    html1+='  </html>\n'
  if (process.env.SMTP_ENABLED) {
    if (context) {
           
      const msg = {
          to: to, // Change to your recipient
          from: process.env.sendgrid_sender, // Change to your verified sender
          subject: subject,
          html: html1,
        }

      return  sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
      })
      .catch((error) => {
        console.error(error)
      })
  } 
  }
};
const verifyEmail = async(code, email,requestData) => {
    let context = {
        code: code,
        firstName:requestData.firstName
    }
    options1.viewEngine.defaultLayout = 'emailVerification'
    transport.use('compile', mailerhbs(options1));
    sendVerifyMail(email, "Activate your Venn account", "emailVerification", context)
    return true;
};

const sendForgetPassword = async(code, email,requestData) => {
    let context = {
        code: code,
        firstName:requestData.firstName
    }
    options2.viewEngine.defaultLayout = 'forgetpassword'
    transport.use('compile', mailerhbs(options2));
    sendForgetMail(email, "Forgot your Venn password?", "forgetpassword", context)

    return true;
};

const adminDeleteAccount = async(email,firstName) => {
  let context = {
      firstName
  }
  options2.viewEngine.defaultLayout = 'adminDeleteAccount'
  transport.use('compile', mailerhbs(options2));
  adminDeleteuserAccountMail(email, "Your Venn account has been deleted", "adminDeleteAccount", context)

  return true;
};


const userDeleteAccount = async(email,firstName) => {
  let context = {
      firstName
  }
  options2.viewEngine.defaultLayout = 'userDeleteAccount'
  transport.use('compile', mailerhbs(options2));
  userDeleteAccountMail(email, "Your Venn account has been deleted", "userDeleteAccount", context)

  return true;
};

const paswordConfirmation = async(email,firstName) => {
  let context = {
      firstName,
  }
  options2.viewEngine.defaultLayout = 'forgetpassword'
  transport.use('compile', mailerhbs(options2));
  passwordChangeConfirmation(email, "Venn password changed", "forgetpassword", context)

  return true;
};


const sendWaitlistDetail = async(data) => {
    let context = {
        firstName: data.firstName,
        lastName:data.lastName,
        email:data.emailId
    }
    options3.viewEngine.defaultLayout = 'waitlist'
    transport.use('compile', mailerhbs(options3));
    sendWaitlistMail(["support@getvenn.com","venn@joshiinc.com"], "User Waitlisted", "waitlist", context)
    return true;
};

const sendReportDetail = async(data) => {
  let context = {
    reason: data.reason,
    reportedUserFirstName: data.reportedUserFirstName,
    reportedUserLastName: data.reportedUserLastName,
    reportedUserId: data.reportedUserId,
    reportedUserEmail: data.reportedUserEmail,
    reportingUserFirstName: data.reportingUserFirstName,
    reportingUserLastName: data.reportingUserLastName,
    reportingUserEmail: data.reportingUserEmail,
    reportingUserId: data.reportingUserId,


     
  }
  options3.viewEngine.defaultLayout = 'waitlist'
  transport.use('compile', mailerhbs(options3));
  let subject=`User Reported - ${data.reportingUserId} / ${data.reportedUserId}`
  await sendReportMail(["support@getvenn.com","venn@joshiinc.com"], subject, "report", context)
  return true;
};

const sendInviteRequestDetail = async(data) => {
  let context = {
    reason: data.reason,
    userFirstName: data.userFirstName,
    userLastName: data.userLastName,
    userId: data.userId,
    userEmail: data.userEmail
     
  }
  options3.viewEngine.defaultLayout = 'Invite'
  transport.use('compile', mailerhbs(options3));
  let subject=`Referral Codes Request - ${data.userId}`
  await sendInviteRequest(["support@getvenn.com","venn@joshiinc.com"], subject, "Invite", context)
  return true;
};

const sendFeedbackDetails = async(data) => {
  let context = {
    reason: data.reason,
     firstName: data.firstName,
     lastName: data.lastName,
     emailId: data.emailId,
  }
  options3.viewEngine.defaultLayout = 'waitlist'
  transport.use('compile', mailerhbs(options3));
  let subject=`User Feedback - ${data.userId}`
  await feedbackMail(["support@getvenn.com","venn@joshiinc.com"], subject, "report", context)
  return true;
};


module.exports = {
    verifyEmail,
    sendForgetPassword,
    sendWaitlistDetail,
    sendReportDetail,
    sendFeedbackDetails,
    paswordConfirmation,
    adminDeleteAccount,
    userDeleteAccount,
    sendInviteRequestDetail
  
}
