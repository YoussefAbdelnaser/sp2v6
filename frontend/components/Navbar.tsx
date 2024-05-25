/* eslint-disable prettier/prettier */
// Navbar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../authContext';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const {
    state: { isLoggedIn },
    dispatch,
  } = useAuth();
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`http://localhost:4000/${email}`);
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navLinks}>
        <Link href="/" legacyBehavior>
          <a style={styles.navLink}>Home</a>
        </Link>
        <Link href="/products" legacyBehavior>
          <a style={styles.navLink}>Products</a>
        </Link>
        {isLoggedIn ? (
          <>
            <Link href="/cart" legacyBehavior>
              <a style={styles.navLink}>Cart</a>
            </Link>
            <Link href="/orders" legacyBehavior>
              <a style={styles.navLink}>Orders</a>
            </Link>
            <form onSubmit={handleEmailSubmit} style={styles.emailForm}>
              <label htmlFor="email-input" style={styles.label}>
                Enter email to view profile
              </label>
              <input
                type="email"
                id="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Go
              </button>
            </form>
            <a onClick={handleLogout} style={styles.navLink}>
              Logout
            </a>
          </>
        ) : (
          <>
            <Link href="/login" legacyBehavior>
              <a style={styles.navLink}>Login</a>
            </Link>
            <Link href="/signup" legacyBehavior>
              <a style={styles.navLink}>Signup</a>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#007bff',
    padding: '0.5rem 1rem',
  },
  emailForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    marginRight: '0.5rem',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '0.25rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
};

export default Navbar;
