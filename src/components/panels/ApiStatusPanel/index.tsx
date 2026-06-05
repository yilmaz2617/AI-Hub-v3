import React, { memo } from 'react';

const ApiStatusPanel: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Status</h2>
    </div>
  );
};

export default memo(ApiStatusPanel);
