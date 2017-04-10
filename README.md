# palm-funday-auth

Repo by Lubs and Jack
https://github.com/foundersandcoders/oauth

## Intro
Building on the Oauth workshop you did yesterday, we are now going to use the access token you received from Github to get some information about the user and save it in a cookie. This is done to avoid them having to reauthenticate every time they request a resource.

We are going to turn the access token and the user information we get from Github into a JWT using the `jsonwebtoken` module. We are then going to set this JWT as a cookie using `server.state()`. Finally we are going to configure a route with an authenitcation strategy using the `hapi-auth-jwt2` scheme, `jwt`. `hapi-auth-jwt2` decodes the JWT stored in the cookie named `token` so that we can read it, check to see if it is valid, and decide how to reply.

At the moment, a variable `userName` is used to check if that user is 'valid'.

## Quickstart

```bash
git clone https://github.com/mcelearr/palm-funday-auth.git & cd palm-funday-auth
git checkout solution
npm install
npm run create-project
npm run dev
```
