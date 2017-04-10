const hapi = require('hapi');
const inert = require('inert');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const request = require('request');
const jwt = require('jsonwebtoken');
const hapiAuthJwt2 = require('hapi-auth-jwt2');
require('env2')('./config.env');

const server = new hapi.Server();

server.connection({
  port: 4000,
  tls: {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
  }
});

server.register([inert, hapiAuthJwt2], (err) => {
  if (err) {
    console.log(err);
  }
  // insert your github username here
  const userName = 'mcelearr';

  const validate = (token, validateRequest, callback) => {
    // decoded token, it automaitcally decodes it
    if (!token.user.username === userName) {
      return callback(null, false);
    }
    return callback(null, true);
  };

  server.auth.strategy('jwt', 'jwt',
    {
      key: process.env.SECRET,
      validateFunc: validate,
      verifyOptions: { algorithms: ['HS256'] }
    });

  server.route([
    {
      method: 'GET',
      path: '/{file*}',
      handler: {
        directory: {
          path: path.join(__dirname, 'public'),
          index: 'hello.html'
        }
      }
    },
    {
      method: 'GET',
      path: '/login',
      handler: (loginRequest, reply) => {
        const queries = querystring.stringify({
          client_id: process.env.CLIENT_ID,
          redirect_uri: 'https://localhost:4000/welcome'
        });
        reply.redirect(`https://github.com/login/oauth/authorize?${queries}`);
      }
    },
    {
      method: 'GET',
      path: '/welcome',
      handler: (req, reply) => {
        const data = {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code: req.query.code
        };
        const options = {
          method: 'POST',
          body: data,
          json: true,
          url: 'https://github.com/login/oauth/access_token'
        };
        request(options, (error, response, body) => {
          if (error) {
            return reply(error);
          }
          if (!body.access_token) {
            return reply('something went wrong.');
          }
          const headers = {
            'User-Agent': 'oauth_github_jwt',
            Authorization: `token ${body.access_token}`
          };
          const url = 'https://api.github.com/user';

          return request.get({
            url,
            headers
          }, (githubPostErr, githubPostres, githubPostbody) => {
            if (githubPostErr) {
              console.log(githubPostErr);
            }
            const parsedBody = JSON.parse(githubPostbody);
            const payload = {
              user: {
                username: parsedBody.login,
                img_url: parsedBody.avatar_url,
                user_id: parsedBody.id
              },
              accessToken: parsedBody.access_token
            };
            const JWToptions = {
              expiresIn: Date.now() + (24 * 60 * 60 * 1000),
              subject: 'github-data'
            };
            const secret = process.env.SECRET;
            jwt.sign(payload, secret, JWToptions, (JWTerr, token) => {
              reply
              .redirect('/secure') // make a new route for the redirect, config it with an authentication strategy
              .state('token', token,
                {
                  path: '/',  // the token is valid for every path starting with /
                  isHttpOnly: false,
                  isSecure: process.env.NODE_ENV === 'PRODUCTION'
                });
            });
          });
        });
      }
    },
    {
      method: 'GET',
      path: '/secure',
      config: { auth: 'jwt' },
      handler: (req, reply) => {
        reply('It worked');
      }
    }
  ]);
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server listening on port ${server.info.port}`);
});
