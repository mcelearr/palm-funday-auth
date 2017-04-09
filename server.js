const hapi = require('hapi');
const inert = require('inert');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const request = require('request');
require('env2')('./config.env');

const server = new hapi.Server();

server.connection({
  port: 4000,
  tls: {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
  }
});

server.register(inert, (err) => {
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
      handler: (request, reply) => {
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
            reply('something went wrong.')
          }
          // store access token
          reply.redirect('/');
        })
      }
    }
  ]);
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server listening on port ${server.info.port}`);
});
