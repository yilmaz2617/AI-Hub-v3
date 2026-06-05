import React, { memo } from 'react';
// MEVCUT ChatPanel KODUNU BURAYA YAPIŞTIR
// Sadece son satırı değiştir: export default ChatPanel; → export default memo(ChatPanel);

const ChatPanel: React.FC = () => {
  // ... mevcut implementasyon
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chat</h2>
      {/* Mevcut chat UI kodun burada */}
    </div>
  );
};

export default memo(ChatPanel);
