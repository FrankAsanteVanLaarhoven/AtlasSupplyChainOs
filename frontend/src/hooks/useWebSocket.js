import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [agentUpdates, setAgentUpdates] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = BACKEND_URL
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      
      wsRef.current = new WebSocket(`${wsUrl}/api/ws`);

      wsRef.current.onopen = () => {
        console.log('[ATLAS WebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'agent_update') {
            setAgentUpdates(data.agents);
            setLastUpdate(data.timestamp);
          }
        } catch (e) {
          console.error('[ATLAS WebSocket] Parse error:', e);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('[ATLAS WebSocket] Disconnected', event.code);
        setIsConnected(false);
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`[ATLAS WebSocket] Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.log('[ATLAS WebSocket] Connection unavailable');
      };
    } catch (error) {
      console.log('[ATLAS WebSocket] Failed to create connection');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    agentUpdates,
    lastUpdate,
    sendMessage,
    reconnect: connect
  };
};

export default useWebSocket;
