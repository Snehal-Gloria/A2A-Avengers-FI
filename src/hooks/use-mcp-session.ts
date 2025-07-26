// src/hooks/use-mcp-session.ts
"use client";

import { create } from 'zustand';

interface McpSessionState {
  isConnected: boolean;
  serverUrl: string | null;
  setIsConnected: (status: boolean) => void;
  setServerUrl: (url: string | null) => void;
}

export const useMcpSessionStore = create<McpSessionState>((set) => ({
  isConnected: false,
  serverUrl: null,
  setIsConnected: (status) => set({ isConnected: status }),
  setServerUrl: (url) => set({ serverUrl: url }),
}));
