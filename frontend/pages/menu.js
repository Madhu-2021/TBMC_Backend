import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/Menu.module.css';

export default function Menu() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get('https://tbmc-backend.onrender.com/api/food');
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

  if (loading) {
    return <div className={styles.loading}>Loading menu...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Menu - Food Assistant</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Our Menu</h1>
        
        <div className={styles.menuGrid}>
          {foodItems.map((item) => (
            <div key={item.id} className={styles.menuItem}>
              <h2>{item.name}</h2>
              <p className={styles.description}>{item.description}</p>
              <p className={styles.price}>${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        
        <div className={styles.navigation}>
          <Link href="/">
            <button className={styles.backButton}>Back to Home</button>
          </Link>
          <Link href="/order">
            <button className={styles.orderButton}>Place Order</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
