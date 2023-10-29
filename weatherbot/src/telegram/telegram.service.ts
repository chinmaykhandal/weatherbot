import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose from 'mongoose';
import axios from 'axios';
import * as cron from 'node-cron';


const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = '6866526551:AAEl_YlHFJYzSmFi-jCSc41oLs7WvAvdsaA';
const WEATHER_API_KEY = '9c6ade30cbad15171681b2dcd78f3843';
@Injectable()
export class TelegramService {
  private readonly bot: any;
  private logger = new Logger(TelegramService.name);

  constructor(
    @InjectModel(User.name)
    private UserModel: mongoose.Model<User>
  ) {
    this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    this.bot.on('message', this.onReceiveMessage);

    cron.schedule('* * * * *', async () => {
      this.logger.log('Sending weather updates to subscribed users...');

      // Get a list of subscribed users with their preferred cities
      const subscribedUsers = await this.getSubscribedUsers();

      // Send weather updates to each user's preferred city
      for (const user of subscribedUsers) {
        await this.sendWeatherUpdateForUser(user);
      }

      this.logger.log('Weather updates sent.');
    });
  }

  onReceiveMessage = async (msg: any) => {
    this.logger.debug(msg);
    const username = msg.from.id;
    const first_name = msg.from.first_name;
    let user; // Declare the user variable

    if (username) {
      const userExists = await this.doesUserExist(username);
      if (userExists) {
        this.logger.log('user exists');
      } else {
        this.logger.log('user doesnt exist');

        await this.createUser(username, first_name);
      }

      const chatId = msg.chat.id;
      const text = msg.text;
      const userId = msg.from.id;
      user = await this.getUserInfo(userId);
      // Handle the /subscribe command
      if (text === '/subscribe') {
        // Retrieve user information

        if (!user) {
          await this.createUser(userId, first_name); // Create a new user if they don't exist
        }

        if (user && !user.isSubscribed) {
          // If the user is not already subscribed, prompt for city
          this.subscribeUser(userId);
          this.bot.sendMessage(
            chatId,
            'You are now subscribed to daily weather updates. Please tell me your city for weather information.',
          );
        } else {
          // If the user is already subscribed, inform them
          this.bot.sendMessage(
            chatId,
            'You are already subscribed to daily weather updates.',
          );
        }
      }
      // Handle user's response to city for weather updates
      if (msg.text && user) {
        if (user.isSubscribed && !user.city) {
          const city = msg.text;
          if (city) {
            await this.updateUserCity(userId, city);
            this.bot.sendMessage(
              chatId,
              `City set to ${city}. You will receive daily weather updates for ${city}.`,
            );
          }
        }
      }
    }
  };

  async getUserInfo(userId: number): Promise<User | null> {
    const user = await this.UserModel.findOne({ userid: userId }).exec();
    return user;
  }

  async subscribeUser(userId: number): Promise<void> {
    // Update the user's subscription status in the database
    await this.UserModel.updateOne(
      { userid: userId },
      { $set: { isSubscribed: true } },
    ).exec();
    this.logger.log('subscribed');
  }


  async doesUserExist(username: number): Promise<boolean> {
    const user = await this.UserModel.findOne({ userid: username }).exec();
    this.logger.log(user);
    return !!user; // Return true if the user exists, false otherwise
  }

  async createUser(username: number, first_name: string): Promise<void> {
    const newUser = new this.UserModel({
      userid: username,
      name: first_name,
      // Add other user properties here as needed
    });
    await newUser.save();
    this.logger.log('New user created');
  }

  async getSubscribedUsers(): Promise<User[]> {
    return this.UserModel.find({ isSubscribed: true }).exec();
  }


  async sendWeatherUpdateForUser(user: User): Promise<void> {
    if (user.city) {
      // Fetch weather data for the user's preferred city using an external API
      try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${user.city}&appid=${WEATHER_API_KEY}`);
        
        const kelvinTemperature = weatherResponse.data.main.temp;
        const celsiusTemperature = (kelvinTemperature - 273.15).toFixed(2); // Convert and round to two decimal points
        const chatId = user.userid;
  
        // Send weather updates to the user's preferred city
        this.bot.sendMessage(chatId, `Weather update for ${user.city}: ${celsiusTemperature}°C`);
      } catch (error) {
        this.logger.error('Failed to fetch weather data:', error);
      }
    }
  }
  
  // Function to update the user's city preference
  async updateUserCity(userId: number, city: string): Promise<void> {
    await this.UserModel.updateOne({ userid: userId }, { city: city }).exec();
    this.logger.log(`City updated to ${city}`);
  }
}
