// Home.tsx
/* eslint-disable prettier/prettier */
import { GetServerSideProps } from 'next';
import { getTopOffers } from '@/services/api';
import ProductList from '../components/ProductList';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

interface HomeProps {
  topOffers: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    topOffer?: boolean;
  }[];
}

const Home: React.FC<HomeProps> = ({ topOffers }) => {
  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.title}>Top Offers</h1>
        <ProductList products={topOffers} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const topOffers = await getTopOffers();
  return {
    props: {
      topOffers,
    },
  };
};

export default Home;
