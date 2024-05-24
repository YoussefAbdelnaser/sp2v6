/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem } from '../interface/cart.interface';
import { CreateCartDTO, CartItemDTO } from '../dto/create-cart.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { OrderService } from './order.service'; // Import OrderService
import { Order } from '../interface/order.interface';

@Injectable()
export class CartService {
  private readonly productServiceUrl = 'http://localhost:3003/products'; // Adjust this URL based on your Product service

  constructor(
    @InjectModel('Cart') private readonly cartModel: Model<Cart>,
    private readonly httpService: HttpService,
    private readonly orderService: OrderService, // Inject OrderService
  ) {}

  private async validateAndEnrichCartItem(cartItemDTO: CartItemDTO): Promise<CartItem> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<AxiosResponse<any>>(`${this.productServiceUrl}/${cartItemDTO.productId}`)
      );
      const product = response.data;

      if (!product) {
        throw new NotFoundException(`Product with ID ${cartItemDTO.productId} not found.`);
      }

      return {
        productId: cartItemDTO.productId,
        quantity: cartItemDTO.quantity,
        purchaseOption: cartItemDTO.purchaseOption,
        startDate: cartItemDTO.startDate,
        endDate: cartItemDTO.endDate,
        customization: cartItemDTO.customization,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Product with ID ${cartItemDTO.productId} not found.`);
      } else {
        console.error('Error validating cart item:', error.message);
        throw new InternalServerErrorException('Failed to validate cart item.');
      }
    }
  }

  async addToCart(userEmail: string, createCartDTO: CreateCartDTO): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userEmail });

    const validatedItems: CartItem[] = [];
    for (const item of createCartDTO.items) {
      const validatedItem = await this.validateAndEnrichCartItem(item);
      validatedItems.push(validatedItem);
    }

    if (!cart) {
      cart = new this.cartModel({
        userEmail,
        items: validatedItems,
        createdAt: new Date(),
      });
    } else {
      cart.items.push(...validatedItems);
    }

    return await cart.save();
  }

  async getCartByUserEmail(userEmail: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userEmail }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found for the user.');
    }
    return cart;
  }

  async getOrdersByUserEmail(userEmail: string): Promise<Order[]> {
    const orders = await this.orderService.getOrdersByUserEmail(userEmail);
    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found for the user.');
    }
    return orders;
  }
  async placeOrder(userEmail: string): Promise<Order> {
    const cart = await this.cartModel.findOne({ userEmail });

    if (!cart || cart.items.length === 0) {
        throw new NotFoundException('No items in the cart to place an order.');
    }

    const order = await this.orderService.createOrder(userEmail, cart.items);
    await this.cartModel.deleteOne({ userEmail });
    return order;
}

async deleteCartItem(userEmail: string, productId: string): Promise<Cart> {
  const cart = await this.cartModel.findOne({ userEmail });

  if (!cart) {
    throw new NotFoundException('Cart not found for the user.');
  }

  // Find the index of the item to be deleted
  const index = cart.items.findIndex(item => item.productId.toString() === productId);

  if (index === -1) {
    throw new NotFoundException('Product not found in the cart.');
  }

  // Remove the item from the items array
  cart.items.splice(index, 1);

  // Save the updated cart
  return await cart.save();
}




}
