import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [TelegramService],
  controllers: [TelegramController]
})
export class TelegramModule {}
