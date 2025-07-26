// src/lib/mcp-api.ts

export interface ToolInfo {
  name: string;
  description: string;
}

export interface ResourceInfo {
  uri: string;
  description: string;
}

const API_BASE_URL = 'http://localhost:8000';

async function fetchMcp(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(error.message || 'A network error occurred.');
    }
    throw new Error('An unknown error occurred.');
  }
}

export const connectToServer = (serverUrl: string) => 
  fetchMcp('/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ server_url: serverUrl }),
  });

export const disconnectFromServer = () => 
  fetchMcp('/disconnect', { method: 'POST' });

export const getStatus = () => fetchMcp('/status');

export const listTools = (): Promise<ToolInfo[]> => fetchMcp('/tools');

export const listResources = (): Promise<ResourceInfo[]> => fetchMcp('/resources');

export const callTool = (tool_name: string, args: object | null) =>
  fetchMcp('/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool_name, arguments: args }),
  });

export const readResource = (resource_uri: string) =>
  fetchMcp('/resources/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource_uri }),
  });

export const processQuery = (query: string) =>
  fetchMcp('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
