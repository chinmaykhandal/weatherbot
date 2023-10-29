import { Controller } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {

    constructor(private telegramService: TelegramService){}

    
}
