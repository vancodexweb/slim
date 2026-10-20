import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetGiftsQueryDto } from './dto/get-gifts-query.dto';
import { GiftsService } from './gifts.service';

@ApiTags('gifts')
@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @ApiOperation({
    summary: 'Каталог подарков с фильтрами',
    description:
      'Если ничего не найдено, items пустой, а в suggestions приходят три подарка с лучшим рейтингом',
  })
  @Get()
  findAll(@Query() query: GetGiftsQueryDto) {
    return this.giftsService.findAll(query);
  }

  @ApiOperation({ summary: 'Карточка подарка и 4 похожих из той же категории' })
  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Некорректный id подарка'),
      }),
    )
    id: string,
  ) {
    return this.giftsService.findOne(id);
  }
}
