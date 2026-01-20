// components/GlobalLoading.js
"use client"
import { useEffect, useState } from 'react';
import Loading from './Loading';

const GlobalLoading = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay for demonstration purposes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        children
      )}
    </div>
  );
}

export default GlobalLoading;
