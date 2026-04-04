import React, { Suspense, lazy } from 'react';

// Lazy load components for better performance
const LazyChart = lazy(() => import('./Chart'));

const LazyComponent = ({ children, fallback = null }) => {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 rounded h-32"></div>}>
      {children}
    </Suspense>
  );
};

// Lazy load heavy components
export const LazyChartComponent = ({ ...props }) => (
  <LazyComponent>
    <LazyChart {...props} />
  </LazyComponent>
);

export default LazyComponent;
