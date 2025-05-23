import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Food Assistant</title>
        <meta name="description" content="Food ordering with AI assistant" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Food Assistant
        </h1>

        <p className={styles.description}>
          Your AI-powered food ordering system
        </p>

        <div className={styles.grid}>
          <Link href="/chat">
            <div className={styles.card}>
              <h2>Chat with Assistant &rarr;</h2>
              <p>Get recommendations and ask questions about our food.</p>
            </div>
          </Link>

          <Link href="/menu">
            <div className={styles.card}>
              <h2>View Menu &rarr;</h2>
              <p>Explore our delicious food items and prices.</p>
            </div>
          </Link>

          <Link href="/order">
            <div className={styles.card}>
              <h2>Place Order &rarr;</h2>
              <p>Order your favorite food for delivery or pickup.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}