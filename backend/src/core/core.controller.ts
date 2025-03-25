import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoreService } from './core.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class CoreController {
  constructor(private coreService: CoreService) {}

  // Restaurant endpoints
  @Get('restaurants')
  async getRestaurants(@Request() req) {
    return this.coreService.getRestaurants(req.user.id);
  }

  @Get('restaurants/:id')
  async getRestaurantById(@Param('id') id: string, @Request() req) {
    return this.coreService.getRestaurantById(+id, req.user.id);
  }

  @Post('restaurants')
  async createRestaurant(@Body() data: any, @Request() req) {
    return this.coreService.createRestaurant(data, req.user.id);
  }

  @Put('restaurants/:id')
  async updateRestaurant(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.coreService.updateRestaurant(+id, data, req.user.id);
  }

  @Delete('restaurants/:id')
  async deleteRestaurant(@Param('id') id: string, @Request() req) {
    return this.coreService.deleteRestaurant(+id, req.user.id);
  }

  // Menu endpoints
  @Get('restaurants/:id/menus')
  async getMenus(@Param('id') id: string, @Request() req) {
    return this.coreService.getMenus(+id, req.user.id);
  }

  @Post('restaurants/:id/menus')
  async createMenu(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.coreService.createMenu(data, +id, req.user.id);
  }

  // Supplier endpoints
  @Get('restaurants/:id/suppliers')
  async getSuppliers(@Param('id') id: string, @Request() req) {
    return this.coreService.getSuppliers(+id, req.user.id);
  }

  @Post('restaurants/:id/suppliers')
  async createSupplier(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.coreService.createSupplier(data, +id, req.user.id);
  }

  // Supplier payment endpoints
  @Post('suppliers/:id/payments')
  async createSupplierPayment(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.coreService.createSupplierPayment(data, +id, req.user.id);
  }
}