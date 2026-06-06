import { useEffect, useCallback, useRef } from 'react';
import { useWebBridgeStore, ToolResult } from '../store/webbridgeStore';

// Kimi WebBridge Extension ID (gerekirse)
const EXTENSION_ID = 'kimi-webbridge';

// Runtime message types
interface RuntimeMessage {
  type: string;
  url?: string;
  serverBase?: string;
}

interface RuntimeResponse {
  connected?: boolean;
  serverUrl?: string;
  success?: boolean;
  error?: string;
  ok?: boolean;
  reason?: string;
}

export function useWebBridge() {
  const store = useWebBridgeStore();
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extension kurulu mu kontrol et
  const checkExtension = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
      }
      // Extension'a ping at
      const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
        type: 'GET_STATUS',
      } as RuntimeMessage);
      const resp = response as RuntimeResponse;
      if (resp && !resp.error) {
        store.setExtensionInstalled(true);
        if (resp.connected) {
          store.setStatus('connected');
          if (resp.serverUrl) store.setServerUrl(resp.serverUrl);
        }
        return true;
      }
      return false;
    } catch {
      store.setExtensionInstalled(false);
      return false;
    }
  }, [store]);

  // WebSocket sunucusuna bağlan
  const connect = useCallback(
    async (url?: string) => {
      const targetUrl = url || store.serverUrl;
      store.setStatus('connecting');
      store.setError(null);

      try {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          throw new Error('Chrome Extension API bulunamadı. Kimi WebBridge kurulu mu?');
        }

        const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'CONNECT',
          url: targetUrl,
        } as RuntimeMessage);
        const resp = response as RuntimeResponse;

        if (resp?.error) {
          throw new Error(resp.error);
        }

        if (resp?.success) {
          store.setStatus('connected');
          store.setServerUrl(targetUrl);
        } else {
          throw new Error('Bağlantı başarısız');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        store.setStatus('error');
        store.setError(message);
      }
    },
    [store]
  );

  // Bağlantıyı kes
  const disconnect = useCallback(async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage(EXTENSION_ID, { type: 'DISCONNECT' } as RuntimeMessage);
      }
    } catch {
      // Ignore
    }
    store.setStatus('disconnected');
    store.setError(null);
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
  }, [store]);

  // Bağlantı testi
  const testConnection = useCallback(
    async (url?: string): Promise<boolean> => {
      const targetUrl = url || store.serverUrl;
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          return false;
        }
        const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'TEST_CONNECTION',
          url: targetUrl,
        } as RuntimeMessage);
        const resp = response as RuntimeResponse;
        return resp?.ok === true;
      } catch {
        return false;
      }
    },
    [store]
  );

  // Tool çalıştır
  const executeTool = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      store.addToolCall({
        id: callId,
        name,
        args,
        timestamp: Date.now(),
      });

      try {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          throw new Error('Chrome Extension API bulunamadı');
        }

        // WebBridge extension'a tool_call gönder
        // Not: Extension içindeki WebSocket üzerinden iletilir
        const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'TOOL_CALL',
          payload: { name, args },
        });

        const result: ToolResult = {
          id: callId,
          name,
          data: response,
          timestamp: Date.now(),
        };
        store.setLastResult(result);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Tool çalıştırma hatası';
        const result: ToolResult = {
          id: callId,
          name,
          error: message,
          timestamp: Date.now(),
        };
        store.setLastResult(result);
        throw err;
      }
    },
    [store]
  );

  // Önceden tanımlı tool'lar
  const navigate = useCallback(
    (url: string, options?: { newTab?: boolean }) => {
      return executeTool('navigate', { url, newTab: options?.newTab ?? false });
    },
    [executeTool]
  );

  const snapshot = useCallback(() => {
    return executeTool('snapshot', {});
  }, [executeTool]);

  const click = useCallback(
    (selector: string) => {
      return executeTool('click', { selector });
    },
    [executeTool]
  );

  const fill = useCallback(
    (selector: string, value: string) => {
      return executeTool('fill', { selector, value });
    },
    [executeTool]
  );

  const screenshot = useCallback(
    (options?: { format?: 'png' | 'jpeg'; selector?: string }) => {
      return executeTool('screenshot', {
        format: options?.format ?? 'png',
        selector: options?.selector,
      });
    },
    [executeTool]
  );

  const evaluate = useCallback(
    (code: string) => {
      return executeTool('evaluate', { code });
    },
    [executeTool]
  );

  // Sayfa yüklendiğinde extension'ı kontrol et
  useEffect(() => {
    checkExtension();
  }, [checkExtension]);

  return {
    // State
    status: store.status,
    serverUrl: store.serverUrl,
    lastError: store.lastError,
    toolHistory: store.toolHistory,
    lastResult: store.lastResult,
    isExtensionInstalled: store.isExtensionInstalled,

    // Actions
    checkExtension,
    connect,
    disconnect,
    testConnection,
    executeTool,
    navigate,
    snapshot,
    click,
    fill,
    screenshot,
    evaluate,
    clearHistory: store.clearHistory,
    setServerUrl: store.setServerUrl,
  };
}
