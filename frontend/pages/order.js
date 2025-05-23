import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/Order.module.css';

export default function Order() {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/food');
        setFoodItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError('Failed to load menu. Please try again later.');
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!customerName) {
      alert('Please enter your name');
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));

      const response = await axios.post('http://localhost:3001/api/orders', {
        items: orderItems,
        customerName,
        address
      });
      
      setOrderDetails(response.data);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading menu...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Place Order - Food Assistant</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Place Your Order</h1>

        {orderPlaced ? (
          <div className={styles.orderSuccess}>
            <h2>Order Placed Successfully!</h2>
            <div className={styles.orderDetails}>
              <p><strong>Order ID:</strong> {orderDetails.id}</p>
              <p><strong>Customer:</strong> {orderDetails.customerName}</p>
              <p><strong>Total:</strong> ${orderDetails.total.toFixed(2)}</p>
              <h3>Items:</h3>
              <ul>
                {orderDetails.items.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity} - ${item.itemTotal.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/">
              <button className={styles.homeButton}>Back to Home</button>
            </Link>
          </div>
        ) : (
          <div className={styles.orderContainer}>
            <div className={styles.menuSection}>
              <h2>Menu</h2>
              <div className={styles.menuItems}>
                {foodItems.map((item) => (
                  <div key={item.id} className={styles.menuItem}>
                    <div className={styles.itemInfo}>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <p className={styles.price}>${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className={styles.addButton}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cartSection}>
              <h2>Your Cart</h2>
              {cart.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div key={item.id} className={styles.cartItem}>
                        <div className={styles.itemDetails}>
                          <h3>{item.name}</h3>
                          <p>${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className={styles.itemControls}>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className={styles.removeButton}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className={styles.addButton}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cartTotal}>
                    <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                  </div>
                </>
              )}

              <div className={styles.customerInfo}>
                <h3>Customer Information</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="customerName">Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
                <button 
                  onClick={placeOrder}
                  className={styles.placeOrderButton}
                  disabled={cart.length === 0}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.navigation}>
          <Link href="/">
            <button className={styles.backButton}>Back to Home</button>
          </Link>
        </div>
      </main>
    </div>
  );
}