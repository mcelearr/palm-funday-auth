const hapi = require('hapi');
const inert = require('inert');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
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
  server.route([{
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
  }]);
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server listening on port ${server.info.port}`);
});
