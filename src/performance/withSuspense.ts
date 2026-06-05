import { Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function withSuspense(Component: any) {
  return function WithSuspenseWrapper(props: any) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
