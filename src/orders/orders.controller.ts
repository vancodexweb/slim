import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Оформить заказ',
    description:
      'Цены и итоговая сумма считаются на сервере. Одинаковые giftId в заказе объединяются',
  })
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @ApiOperation({ summary: 'Список заказов, новые сверху' })
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
}
