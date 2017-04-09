const hapi = require('hapi');
const inert = require('inert');
const path = require('path');
const fs = require('fs');

const server = new hapi.Server();

server.connection({
  port: 4000,
  tls: {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
  }
});

server.register(inert, (err) => {
  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'public'),
        index: 'hello.html'
      }
    }
  });
});

server.start((err) => {
  if (err) throw err;
  console.log(`Server listening on port ${server.info.port}`);
});
