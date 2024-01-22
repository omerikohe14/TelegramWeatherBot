const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const expressApp = express();
const port = process.env.PORT || 3000;

expressApp.use(express.static('static'));
expressApp.use(express.json());

console.log('Bot Token:', process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);
const openWeatherApiKey = process.env.OPEN_WEATHER_TOKEN;

expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

bot.command('start', (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome to the Weather telegram bot.\nPlease insert a city around the world', {});
});

bot.command('weather', (ctx) => {
  const location = ctx.message.text.split(' ').slice(1).join(' ');
  console.log(ctx.from);

  if (!location) {
    bot.telegram.sendMessage(ctx.chat.id, 'Please provide a location for weather information.');
    return;
  }

  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherApiKey}`)
    .then((response) => {
      const weatherData = response.data;
      const temperature = weatherData.main.temp;
      const description = weatherData.weather[0].description;
      const message = `Hello, Today's weather in ${location} is ${temperature} K\nDescription: ${description}`;
      bot.telegram.sendMessage(ctx.chat.id, message);
    })
    .catch((error) => {
      console.error('Error fetching weather information:', error.message);
      bot.telegram.sendMessage(ctx.chat.id, 'Sorry, there was an error fetching weather information for the provided location.');
    });
});

bot.launch();

expressApp.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
