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
const openWeatherApiKey = process.env.OPENWEATHERMAP_API_KEY;

expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Variable to store user states (location)
const userStates = new Map();

bot.command('start', (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome to the Weather telegram bot.\nPlease insert a city around the world', {});
  // Set user state to 'awaitingLocation'
  userStates.set(ctx.from.id, 'awaitingLocation');
});

bot.on('message', async (ctx) => {
   bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome to the Weather telegram bot.\nPlease insert a city around the world', {});
  // Set user state to 'awaitingLocation'
  userStates.set(ctx.from.id, 'awaitingLocation');
  console.log(ctx.from);
  const userId = ctx.from.id;
  const userState = userStates.get(userId);

  // Check the user state
  if (userState === 'awaitingLocation') {
    const location = ctx.message.text;

    if (!location) {
      bot.telegram.sendMessage(ctx.chat.id, 'Please provide a location for weather information.');
      return;
    }

    // Fetch and send weather information
    try {
      console.log('Fetching weather information for', location);
      console.log('OpenWeather API Key:', openWeatherApiKey);
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherApiKey}&units=metric`);
      const weatherData = response.data;
      const temperature = weatherData.main.temp;
      const description = weatherData.weather[0].description;
      const message = `Hello, Today's weather in ${location} is ${description} and the temperature is ${temperature} °C.`;
      bot.telegram.sendMessage(ctx.chat.id, message);
    } catch (error) {
      console.error('Error fetching weather information:', error.message);
      bot.telegram.sendMessage(ctx.chat.id, 'Sorry, there was an error fetching weather information for the provided location.');
    }

    // Reset user state
    userStates.delete(userId);
  }
});

bot.launch();

expressApp.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
