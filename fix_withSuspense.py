import os

file_path = r'D:\AI-Hub-v3\src\performance\withSuspense.ts'

content = '''import { Suspense } from 'react';
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
'''

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ withSuspense.ts düzeltildi')
