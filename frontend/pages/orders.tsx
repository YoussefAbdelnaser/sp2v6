/* eslint-disable prettier/prettier */
// pages/orders.tsx
import { useEffect, useState } from 'react';
import { getOrders, getProductById } from '../services/api';
import styles from '../styles/Orders.module.css';

interface Order {
  _id: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  orderDate: string;
  totalAmount: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token not found');
        }

        const response = await getOrders(token);

        // Transform the response to match the Order interface
        const transformedOrders = await Promise.all(
          response.map(async (order: any) => {
            const items = await Promise.all(
              order.items.map(async (item: any) => {
                const product = await getProductById(item.productId);
                return {
                  productId: item.productId,
                  productName: product.name,
                  quantity: item.quantity,
                  price: product.price,
                };
              }),
            );

            return {
              _id: order._id,
              items,
              orderDate: new Date(order.createdAt).toISOString(),
              totalAmount: items.reduce(
                (sum: number, item: any) => sum + item.quantity * item.price,
                0,
              ),
            };
          }),
        );

        setOrders(transformedOrders);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        setError('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className={styles.container}>
      <h1>My Orders</h1>
      {error ? (
        <p>{error}</p>
      ) : orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <h2>Order #{order._id}</h2>
              <p>
                Order Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
              <div className={styles.orderItems}>
                {order.items.map((item) => (
                  <div key={item.productId} className={styles.orderItem}>
                    <p>Product: {item.productName}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <h3>Total Amount: ${order.totalAmount.toFixed(2)}</h3>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
