import React, { memo } from 'react';
// MEVCUT ImprovePanel KODUNU BURAYA YAPIŞTIR (Groq + Gemini entegre)
// Son satır: export default memo(ImprovePanel);

const ImprovePanel: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Improve</h2>
      {/* Mevcut improve UI */}
    </div>
  );
};

export default memo(ImprovePanel);
