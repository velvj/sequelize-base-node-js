const  AppleAuth  = require( 'apple-auth');
const fs = require ('fs');

const config = {
    client_id: 'com.theapplabb.venn',
    team_id: 'BB2J2N75ZB',
    redirect_uri: '', // Leave it blank
    key_id: '279SG2CYQK',
    scope: 'name%20email',
};

const appleAuth = new AppleAuth(
    config,
    fs.readFileSync('./public/AuthKey_279SG2CYQK.p8').toString(),
    'text'
);

module.exports = {
    appleAuth
  };