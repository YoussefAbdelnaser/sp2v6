// Products.tsx
/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Navbar from '../../components/Navbar';
import ProductList from '../../components/ProductList';
import { getProducts, getProductsByCategory } from '../../services/api';
import styles from '../../styles/Products.module.css'; // Import CSS module for styling

interface ProductsPageProps {
  products: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    topOffer?: boolean;
    category: string;
  }[];
}

const Products: React.FC<ProductsPageProps> = ({ products: initialProducts }) => {
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchFilteredProducts = async () => {
        try {
          if (category) {
            const filteredProducts = await getProductsByCategory(category);
            setFilteredProducts(filteredProducts);
          } else {
            setFilteredProducts(initialProducts);
          }
        } catch (error) {
          console.error('Error fetching filtered products:', error);
        }
      };
      
    fetchFilteredProducts();
  }, [category]);

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.title}>All Products</h1>
        <div className={styles.filterContainer}>
          <label htmlFor="category" className={styles.label}>Choose Category:</label>
          <select 
            id="category" 
            onChange={(e) => setCategory(e.target.value)} 
            value={category} 
            className={styles.select}
          >
            <option value="">All Categories</option>
            <option value="Standard Plastic Pallets">Standard Plastic Pallets</option>
            <option value="Heavy-Duty Plastic Pallets">Heavy-Duty Plastic Pallets</option>
            <option value="Hygienic Plastic Pallets">Hygienic Plastic Pallets</option>
            <option value="Nestable Plastic Pallets">Nestable Plastic Pallets</option>
          </select>
        </div>
        <ProductList products={filteredProducts} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await getProducts();
  return {
    props: {
      products,
    },
  };
};

export default Products;
