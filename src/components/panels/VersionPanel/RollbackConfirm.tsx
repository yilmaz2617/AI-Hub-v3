import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import type { VersionSnapshot } from '../../../sync/types';

interface RollbackConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  version: VersionSnapshot | undefined | null;
}

export const RollbackConfirm: React.FC<RollbackConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  version,
}) => {
  if (!version) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rollback Onayı"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            🔄 Geri Dön
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-400 font-medium">⚠️ Dikkat</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Bu versiyona geri dönmek mevcut durumun üzerine yazacaktır. Mevcut durum otomatik olarak
            yeni bir versiyon olarak kaydedilecektir.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Hedef Versiyon:</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-mono text-sm">{version.hash.slice(0, 8)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{version.label || 'İsimsiz'}</p>
            <p className="text-xs text-gray-400">{new Date(version.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
