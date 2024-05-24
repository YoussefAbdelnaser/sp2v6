/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getProductById, addReview, addToCart } from '../../services/api';
import styles from '../../styles/Product.module.css';

interface ProductProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    originalPrice?: number;
    discount?: number;
    availability: boolean;
    specifications: { [key: string]: string };
    customizableOptions: { label: string; options: string[] }[];
    reviews: {
      user: string;
      rating: number;
      comment: string;
      createdAt: Date;
    }[];
  };
}

const Product: React.FC<ProductProps> = ({ product }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseOption, setPurchaseOption] = useState<string>('buy');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customizations, setCustomizations] = useState<{
    [key: string]: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRatingSubmit = async () => {
    try {
      setErrorMessage(null); // Clear previous error
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token not found');
      }

      await addReview(product._id, rating, comment, token);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message === 'Token not found') {
        setErrorMessage('You need to login or signup to do that action.');
        setIsModalOpen(true);
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      setErrorMessage(null); // Clear previous error
      setSuccessMessage(null); // Clear previous success message
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token not found');
      }

      const cartItem = {
        productId: product._id,
        quantity,
        purchaseOption,
        startDate: purchaseOption === 'rent' ? new Date(startDate) : undefined,
        endDate: purchaseOption === 'rent' ? new Date(endDate) : undefined,
        customization: customizations,
      };

      await addToCart(cartItem, token);
      setSuccessMessage('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Token not found') {
        setErrorMessage('You need to login or signup to do that action.');
        setIsModalOpen(true);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  return (
    <main className={styles.container}>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>{errorMessage}</p>
            <button onClick={closeModal} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className={styles.productInfo}>
        <h1>{product.name}</h1>
        <img
          src={`/images/${product._id}.jpg`}
          alt={product.name}
          className={styles.productImage}
        />
        <p className={styles.productDescription}>{product.description}</p>
        <p className={styles.productPrice}>${product.price}</p>
        {product.discount && (
          <p className={styles.productDiscount}>{product.discount}% off</p>
        )}
        <div className={styles.specifications}>
          <h2>Specifications</h2>
          <ul>
            {product.specifications &&
            typeof product.specifications === 'object' ? (
              Object.entries(product.specifications).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))
            ) : (
              <li>No specifications available</li>
            )}
          </ul>
        </div>
      </div>
      <div className={styles.cartAndReviewsContainer}>
        <div className={styles.addToCart}>
          <h2>Add to Cart</h2>
          <label>
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className={styles.quantityInput}
            />
          </label>
          <label>
            Purchase Option:
            <select
              value={purchaseOption}
              onChange={(e) => setPurchaseOption(e.target.value)}
              className={styles.selectInput}
            >
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </label>
          {purchaseOption === 'rent' && (
            <>
              <label>
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateInput}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateInput}
                />
              </label>
            </>
          )}
          {product.customizableOptions &&
            product.customizableOptions.length > 0 && (
              <div className={styles.customizations}>
                <h3>Customizations</h3>
                {product.customizableOptions.map((option) => (
                  <label key={option.label}>
                    {option.label}:
                    <select
                      onChange={(e) =>
                        setCustomizations((prev) => ({
                          ...prev,
                          [option.label]: e.target.value,
                        }))
                      }
                      className={styles.selectInput}
                    >
                      {option.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}
          <button onClick={handleAddToCart} className={styles.addToCartButton}>
            Add to Cart
          </button>
          {successMessage && (
            <p className={styles.successMessage}>{successMessage}</p>
          )}
        </div>
        <div className={styles.reviews}>
          <h2>Reviews</h2>
          {product.reviews.map((review, index) => (
            <div key={index} className={styles.review}>
              <p>
                {review.user}: {review.rating}/5
              </p>
              <p>{review.comment}</p>
              <p>{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          <div className={styles.addReview}>
            <h2>Add a Review</h2>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min="1"
              max="5"
              className={styles.ratingInput}
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              className={styles.commentInput}
            ></textarea>
            <button
              onClick={handleRatingSubmit}
              className={styles.submitButton}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const product = await getProductById(id as string);
  return {
    props: {
      product,
    },
  };
};

export default Product;
