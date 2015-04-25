
##Introduction

This is a bot for WA which is on top of irc. It could be used as a simple logger for irc to add consistency with a mongo database. The idea is that it works as module where you can actually implement your own module listenning to the bot events.


## Run
     $ node bin/www

## Architecture of the app

You have a standard express app with the main file being in app.js. On top of that you have modular modules in app_modules. bot.js is the main irc bot that listen to all the irc event. logger.js is the mongodb storage module that add consistency to the app. It also create a new event which is "new user" when it create an user for the first time.

## Setting up

Create a config.json file at the root of the project with:
{
  "database":{
    "hostname":"<your config>",
    "db_name":"<your config>"
  },
  "irc_bot":{
    "hostname":"<your config>",
    "username":"<your config>",
    "password":"<your config>",
    "channels":[<your config>]
  }
}
It is optimized for WA, therefore you should also edit the client constructor in the bot.js file for your need.

## Creating a module

Just add it in app.js with a parameter for the bot and then listen to on events or create your own event emitter in the new module. You should emit your event with the bot object as it would add consitency to your code.


