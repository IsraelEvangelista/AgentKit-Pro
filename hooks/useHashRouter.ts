import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for hash-based routing
 * Updates the URL hash and syncs with browser back/forward
 */
export const useHashRouter = () => {
  const getCurrentHash = () => {
    const hash = window.location.hash.slice(1); // Remove the #
    return hash || 'dashboard'; // Default to dashboard
  };

  const [currentPage, setCurrentPage] = useState<string>(getCurrentHash);

  // Update state when hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getCurrentHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate to a new page
  const navigate = useCallback((page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    navigate,
  };
};
