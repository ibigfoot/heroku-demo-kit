# Heroku Demo Kit

This is my application used for demonstrating a few different scenarios of having Heroku and Salesforce working together. 
It is probably always going to be under construction, so check back or comment if there is something that is missing.

## Running Locally (Optional)

Make sure you have the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone https://github.com/ibigfoot/heroku-demo-kit.git # or clone your own fork
$ cd heroku-demo-kit
$ npm install
```

You will need a Postgres DB to run this locally. What I do when building locally is create an Heroku app and create an [Heroku Connect](https://devcenter.heroku.com/articles/heroku-connect) configuration. Once you have synced a couple of tables from your Salesforce instance, [export](https://devcenter.heroku.com/articles/heroku-postgres-import-export) your database so you can import to your local Postgres.

[Create your .env file](https://devcenter.heroku.com/articles/heroku-local#copy-heroku-config-vars-to-your-local-env-file) that will contain the necessary environment variables. Then...

```sh
$ heroku local
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)  - this is not a claim that this project is following these btw... 
