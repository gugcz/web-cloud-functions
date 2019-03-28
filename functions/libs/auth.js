let auth = require('./database').auth;

exports.validateFirebaseToken = function (req, res, next) {

  const authorization = req.get('authorization')
  console.log('Check if request is authorized with Firebase ID token');
  console.log(authorization);
  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;

  }
  let idToken;
  if (authorization && authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = authorization.split('Bearer ')[1];
  }
  return auth.verifyIdToken(idToken).then((decodedIdToken) => {
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    return next(req, res);
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  });


};
