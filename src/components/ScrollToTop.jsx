import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Utility Component: Resets window viewport scroll positions
 * to coordinate origin (0,0) during active location route changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
