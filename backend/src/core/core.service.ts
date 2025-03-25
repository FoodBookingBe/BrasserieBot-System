import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoreService {
  constructor(private prisma: PrismaService) {}

  // Restaurant management
  async getRestaurants(userId: number) {
    return this.prisma.restaurant.findMany({
      where: { ownerId: userId },
    });
  }

  async getRestaurantById(id: number, userId: number) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        menus: true,
        suppliers: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async createRestaurant(data: any, userId: number) {
    return this.prisma.restaurant.create({
      data: {
        ...data,
        owner: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateRestaurant(id: number, data: any, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(id, userId);

    return this.prisma.restaurant.update({
      where: { id },
      data,
    });
  }

  async deleteRestaurant(id: number, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(id, userId);

    return this.prisma.restaurant.delete({
      where: { id },
    });
  }

  // Menu management
  async getMenus(restaurantId: number, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(restaurantId, userId);

    return this.prisma.menu.findMany({
      where: { restaurantId },
      include: {
        items: true,
      },
    });
  }

  async createMenu(data: any, restaurantId: number, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(restaurantId, userId);

    return this.prisma.menu.create({
      data: {
        ...data,
        restaurant: {
          connect: { id: restaurantId },
        },
      },
    });
  }

  // Supplier management
  async getSuppliers(restaurantId: number, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(restaurantId, userId);

    return this.prisma.supplier.findMany({
      where: { restaurantId },
      include: {
        products: true,
        payments: true,
      },
    });
  }

  async createSupplier(data: any, restaurantId: number, userId: number) {
    // Check if restaurant exists and belongs to user
    await this.getRestaurantById(restaurantId, userId);

    return this.prisma.supplier.create({
      data: {
        ...data,
        restaurant: {
          connect: { id: restaurantId },
        },
      },
    });
  }

  // Supplier payment management
  async createSupplierPayment(data: any, supplierId: number, userId: number) {
    // Check if supplier exists and belongs to user's restaurant
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        restaurant: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    if (supplier.restaurant.ownerId !== userId) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return this.prisma.supplierPayment.create({
      data: {
        ...data,
        supplier: {
          connect: { id: supplierId },
        },
      },
    });
  }
}