/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import {
  getCartItems,
  placeOrder,
  getProductById,
  deleteCartItem,
} from '../services/api'; // Assuming getProduct is exported from '../services/api'
import styles from '../styles/Cart.module.css';

const Cart: React.FC = () => {
  type Product = {
    _id: string;
    name: string;
    price: number;
  };

  type CartItem = {
    _id: string;
    productId: string;
    product?: Product; // Add a product field to store the product details
    quantity: number;
    purchaseOption?: 'rent';
    startDate?: Date;
    endDate?: Date;
    customization?: Record<string, unknown>;
  };

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add isLoading state

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true); // Set isLoading to true at the start of the fetch
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token not found');
        }

        const response = await getCartItems(token);
        const items = response.items;

        // Fetch the product details for each item
        for (const item of items) {
          const product = await getProductById(item.productId);
          item.product = product;
        }

        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token not found');
      }

      await placeOrder(cartItems, token);
      setCartItems([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const handleDeleteItem = async (productId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token not found');
      }

      await deleteCartItem(productId, token); // Call deleteCartItem with the productId
      // Refetch cart items after deletion
      const updatedCartItems = cartItems.filter(
        (item) => item.productId !== productId,
      );
      setCartItems(updatedCartItems);
      alert('Item deleted from the cart successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item from the cart.');
    }
  };

  return (
    <main className={styles.container}>
      <h1>Cart</h1>
      {cartItems && cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className={styles.cartItems}>
          {cartItems.map((item) => (
            <div key={item._id} className={styles.cartItem}>
              {item.product && (
                <div className={styles.productBox}>
                  <img
                    src={`/images/${item.product._id}.jpg`}
                    alt={item.product.name}
                    className={styles.cartItemImage}
                  />
                  <div>
                    <h2>{item.product.name}</h2>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.product.price}</p>
                    {item.purchaseOption === 'rent' && (
                      <p>
                        Rental Period:{' '}
                        {new Date(item.startDate).toLocaleDateString()} -{' '}
                        {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    )}
                    {item.customization && (
                      <p>
                        Customization:{' '}
                        {Object.entries(item.customization).map(
                          ([key, value]) => (
                            <span key={key}>
                              {key}: {value}
                            </span>
                          ),
                        )}
                      </p>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.productId)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={handlePlaceOrder}
            className={styles.placeOrderButton}
          >
            Place Order
          </button>
        </div>
      )}
    </main>
  );
};

export default Cart;
