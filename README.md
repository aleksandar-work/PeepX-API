# Peep X Api

### Currently being hosted on AWS at http://3.130.226.194/v1

API for the PeepX Mobile App...

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [Docker](https://www.docker.com/) & [Docker-Compose](https://docs.docker.com/compose/)
* [npx](https://github.com/zkat/npx)

If you aren't using Docker then you'll need to follow Argon2 [install steps](https://github.com/ranisalt/node-argon2/#before-installing)

### Windows Installation

* Download [Cygwin](https://www.cygwin.com/) 
* In Cygwin install latest version of gcc-core and clang
* Open Powershell administrator and user command `npm install --global --production windows-build-tools` wait 10-15 minutes depending on system.
* Once finished, open a new terminal and go to PeepX-API directory, then use command `yarn add argon2`
* Test with `yarn start` command to see if installation was successful.

## Installing

* Copy the .env.example file to a new .env file and fill in the variables like so, you can find them in the resources channel in slack

```
DB_URI=<DB_URI || mongodb://127.0.0.1:27017/db>
TEST_DB_URI=<TEST_DB_URI || mongodb://127.0.0.1:27017/db_test>
JWT_SECRET=<JWT_SECRET || myjwtsecret>
JWT_ISSUER=<JWT_ISSUER || myapp>
DEFAULT_OAUTH_PASSWORD=<DEFAULT_OAUTH_PASSWORD || password123>
CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME || sdad90dsa>
CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY || 903909409320493>
CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET || ds90dsa-ds9a0ds9a-dsa9d0>
CLOUDINARY_URL=<CLOUDINARY_URL || cloudinary://903909409320493:ds90dsa-ds9a0ds9a-dsa9d0@sdad90dsa>
```

* Then run `yarn` from a terminal to install packages

* Once done, `yarn start` with start the server in development mode with live reload, and `yarn prod` will build the API for production

## Current endpoints

### /v1/users

* `GET /v1/users` -> Returns all users in DB

* `POST /v1/users` -> Creates a new user from data in the request body
* `A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 8 - 30 characters long.`
```
{
    "firstName": "myfirstname",
    "lastName": "mylastname",
    "userName": "myusername",
    "email": "myemail@email.com",
    "password": "My_password(&)1234"
}
```

* `GET /v1/users/:id` -> Returns a user found by id provided

* `PATCH /v1/users/:id` -> Updates a user found by id provided with data in request body

* `DELETE /v1/users/:id` -> Deletes a user found by id provided

* `GET /v1/users/me` -> Returns the currently logged in user data based on the `authorization` header provided in the request headers

* `POST /v1/users/seed?amount=20` -> Seeds the DB with the amount of users specified in the request query param 'amount'

### /v1/login

* `POST /v1/login` -> Login user with email & password provided in the request body
```
{
    "email": "myemail@email.com",
    "password": "My_password(&)1234"
}
```

* `POST /v1/login/oauth` -> Login user with OAuth provider & oauth access token from request body
```
{
    "provider": "GOOGLE",
    "oauthToken": "ADSA930293SA"
}
```

### /v1/logout

* `POST /v1/logout` -> Removes req.user from server

### /v1/nearByUsers

* `PATCH /v1/nearByUsers?latitude=29.2190&longitude=39.3209` -> Updates / Creates a location record for the user found by the id from authToken in the request headers. Latitude and Longitude query params are required

* `GET /v1/nearByUsers` -> Finds users that are near by based on last saved location record, also requires an authToken in authorization request headers

## Running the tests

* Make sure you have a MongoDB instance up and the `.env` variables are set.

* Run `yarn test`

## Deployment

* Fill in the `.env` file with the appropriate variables following the `.env.example` file

* Be sure that the `DB_URI` in the `.env` file looks similar to this `DB_URI=mongodb://mongo:27017/peepx`

* Run `docker-compose up -d`, that will start MongoDB & the API

## Built With

* [Express](https://expressjs.com/) - The api framework used
* [MongoDB](https://www.mongodb.com/) - Database store
* [Argon2](https://github.com/ranisalt/node-argon2/) - Used to hash password
* [Mocha](https://mochajs.org/) - For testing
* [Bunyan](https://github.com/trentm/node-bunyan/) - Used for logging
