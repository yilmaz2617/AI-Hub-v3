import React, { Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function withSuspense(Component: React.ComponentType<Record<string, unknown>>) {
  return function WithSuspenseWrapper(props: Record<string, unknown>) {
    return React.createElement(
      Suspense,
      { fallback: React.createElement(LoadingSpinner, null) },
      React.createElement(Component, props)
    );
  };
}
