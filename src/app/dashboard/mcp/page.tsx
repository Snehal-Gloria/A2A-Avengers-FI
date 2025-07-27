// src/app/dashboard/mcp/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  connectToServer,
  disconnectFromServer,
  getStatus,
  listTools,
  callTool,
  listResources,
  readResource,
  processQuery,
  type ToolInfo,
  type ResourceInfo,
} from '@/lib/mcp-api';
import { useMcpSessionStore } from '@/hooks/use-mcp-session';
import { Loader2, Bot, Power, PowerOff, User, CornerDownLeft, Server, Network, FileCode, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// --- Sub-components for each tab ---

function StatusTab() {
  const { toast } = useToast();
  const { isConnected, serverUrl, setIsConnected, setServerUrl } = useMcpSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState(serverUrl || 'http://localhost:8000');

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await connectToServer(urlInput);
      setIsConnected(true);
      setServerUrl(urlInput);
      toast({ title: 'Success', description: response.message });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to connect' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await disconnectFromServer();
      setIsConnected(false);
      setServerUrl(null);
      toast({ title: 'Success', description: response.message });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to disconnect' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check status on initial load
    const checkInitialStatus = async () => {
        try {
            const status = await getStatus();
            setIsConnected(status.connected);
            setServerUrl(status.server_url);
        } catch (e) {
            // It's okay if this fails, means server not connected yet
        }
    };
    checkInitialStatus();
  }, [setIsConnected, setServerUrl]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>MCP Connection</CardTitle>
            <CardDescription>Manage your connection to the MCP server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? `Connected to ${serverUrl}` : 'Not Connected'}</span>
            </div>
            {!isConnected ? (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        value={urlInput} 
                        onChange={(e) => setUrlInput(e.target.value)} 
                        placeholder="http://localhost:8000"
                        disabled={isLoading}
                    />
                    <Button onClick={handleConnect} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Power />}
                        Connect
                    </Button>
                </div>
            ) : (
                <Button onClick={handleDisconnect} disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="animate-spin" /> : <PowerOff />}
                    Disconnect
                </Button>
            )}
        </CardContent>
    </Card>
  );
}

function ToolsTab() {
    const { toast } = useToast();
    const { isConnected } = useMcpSessionStore();
    const [tools, setTools] = useState<ToolInfo[]>([]);
    const [selectedTool, setSelectedTool] = useState<ToolInfo | null>(null);
    const [args, setArgs] = useState('{}');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListLoading, setIsListLoading] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setIsListLoading(true);
            listTools()
                .then(setTools)
                .catch(err => toast({ variant: 'destructive', title: 'Error', description: err.message }))
                .finally(() => setIsListLoading(false));
        }
    }, [isConnected, toast]);

    const handleCallTool = async () => {
        if (!selectedTool) return;
        setIsLoading(true);
        setResult('');
        try {
            let parsedArgs = null;
            if (args.trim()) {
              parsedArgs = JSON.parse(args);
            }
            const response = await callTool(selectedTool.name, parsedArgs);
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid JSON or failed to call tool';
            setResult(`Error: ${errorMessage}`);
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isConnected) return <p>Please connect to the MCP server first.</p>;

    return (
        <div className="grid md:grid-cols gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Available Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isListLoading ? <Loader2 className="animate-spin" /> : (
                            <ul className="space-y-2">
                              {tools.map(tool => (
                                <li key={tool.name}>
                                  <Button
                                    variant={selectedTool?.name === tool.name ? 'secondary' : 'ghost'}
                                    className="w-full justify-start text-left h-auto"
                                    onClick={() => setSelectedTool(tool)}
                                  >
                                    <div className="flex flex-col w-full">
                                      <span className="font-semibold">{tool.name}</span>
                                      <span
                                        className="text-xs text-muted-foreground break-words max-w-[1360px] whitespace-normal"
                                        style={{ wordBreak: 'break-word' }}
                                      >
                                        {tool.description}
                                      </span>
                                    </div>
                                  </Button>
                                </li>
                              ))}
                            </ul>
                        )}
                       
                    </CardContent>
                </Card>
            </div>
            {/* <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Call Tool</CardTitle>
                        <CardDescription>{selectedTool ? `Calling: ${selectedTool.name}` : 'Select a tool to call'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="args">Arguments (JSON)</Label>
                            <Textarea 
                                id="args" 
                                value={args} 
                                onChange={e => setArgs(e.target.value)} 
                                placeholder='{ "key": "value" }'
                                disabled={!selectedTool || isLoading}
                                className="font-mono"
                                rows={5}
                            />
                        </div>
                        <Button onClick={handleCallTool} disabled={!selectedTool || isLoading}>
                             {isLoading && <Loader2 className="animate-spin" />}
                            Call
                        </Button>
                         {result && (
                            <div>
                                <Label>Result</Label>
                                <pre className="p-2 bg-secondary rounded-md text-sm overflow-auto max-h-80">
                                    <code>{result}</code>
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
}

// function ResourcesTab() {
//     const { toast } = useToast();
//     const { isConnected } = useMcpSessionStore();
//     const [resources, setResources] = useState<ResourceInfo[]>([]);
//     const [selectedResource, setSelectedResource] = useState<ResourceInfo | null>(null);
//     const [content, setContent] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [isListLoading, setIsListLoading] = useState(false);

//     useEffect(() => {
//         if (isConnected) {
//             setIsListLoading(true);
//             listResources()
//                 .then(setResources)
//                 .catch(err => toast({ variant: 'destructive', title: 'Error', description: err.message }))
//                 .finally(() => setIsListLoading(false));
//         }
//     }, [isConnected, toast]);

//     const handleReadResource = async (uri: string) => {
//         setIsLoading(true);
//         setContent('');
//         try {
//             const response = await readResource(uri);
//             if (response.success) {
//                 // Try to format if it's JSON
//                 try {
//                     const parsed = JSON.parse(response.content);
//                     setContent(JSON.stringify(parsed, null, 2));
//                 } catch {
//                     setContent(response.content);
//                 }
//             } else {
//                  setContent(`Error: ${response.error}`);
//             }
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Failed to read resource';
//             setContent(`Error: ${errorMessage}`);
//             toast({ variant: 'destructive', title: 'Error', description: errorMessage });
//         } finally {
//             setIsLoading(false);
//         }
//     };
    
//     if (!isConnected) return <p>Please connect to the MCP server first.</p>;

//     return (
//         <div className="grid md:grid-cols-3 gap-6">
//             <div className="md:col-span-1">
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Available Resources</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                          {isListLoading ? <Loader2 className="animate-spin" /> : (
//                             <ul className="space-y-2">
//                                 {resources.map(res => (
//                                     <li key={res.uri}>
//                                         <Button
//                                             variant={selectedResource?.uri === res.uri ? 'secondary' : 'ghost'}
//                                             className="w-full justify-start text-left h-auto"
//                                             onClick={() => {
//                                                 setSelectedResource(res);
//                                                 handleReadResource(res.uri);
//                                             }}
//                                         >
//                                              <div className="flex flex-col">
//                                                 <span className="font-semibold break-all">{res.uri}</span>
//                                                 <span className="text-xs text-muted-foreground">{res.description}</span>
//                                             </div>
//                                         </Button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>
//             <div className="md:col-span-2">
//                 <Card className="min-h-[400px]">
//                     <CardHeader>
//                         <CardTitle>Resource Content</CardTitle>
//                         <CardDescription>{selectedResource ? `Viewing: ${selectedResource.uri}` : 'Select a resource to view its content'}</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         {isLoading ? <Loader2 className="animate-spin" /> : (
//                             <pre className="p-2 bg-secondary rounded-md text-sm overflow-auto max-h-96">
//                                 <code>{content || 'No content to display.'}</code>
//                             </pre>
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }

function GeminiChatTab() {
  type Message = {
    role: 'user' | 'assistant';
    content: string;
  };
  const { toast } = useToast();
  const { isConnected } = useMcpSessionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);
  const [toolLoading, setToolLoading] = useState(false);

  // Automatically trigger /tools/call after connection
  useEffect(() => {
    const triggerToolCall = async () => {
      if (isConnected) {
        setToolLoading(true);
        setToolResult(null);
        setLoginUrl(null);
        try {
          // Call /tools/call with dummy query
          const response = await callTool('fetch_net_worth', {});
          if (response.login_required && response.login_url) {
            setLoginUrl(response.login_url);
          } else {
            setToolResult(response.result);
          }
        } catch (err: any) {
          setToolResult({ error: err.message });
        }
        setToolLoading(false);
      }
    };
    triggerToolCall();
    // Only run when isConnected changes
  }, [isConnected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processQuery(input);
      if (response.success) {
        const assistantMessage: Message = { role: 'assistant', content: response.response };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.response || 'Failed to get response from Gemini');
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) return <p>Please connect to the MCP server first.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini Chat</CardTitle>
        <CardDescription>Chat with Gemini using the tools from the MCP server.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          {/* Show login URL only if response contains login_url and status is login_required */}
          {toolResult && toolResult.status === 'login_required' && toolResult.login_url && (
            <div className="mb-4 p-4 bg-secondary rounded shadow flex flex-col items-start">
              <div className="font-semibold mb-2 text-primary">Authentication Required</div>
              <Button
                asChild
                className="mb-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition"
              >
                <a href={toolResult.login_url} target="_blank" rel="noopener noreferrer">
                  Open Login Page
                </a>
              </Button>
              <div className="mt-2 text-xs text-muted-foreground">After logging in, return here to continue.</div>
            </div>
          )}
          {/* Tool result if not login required and not login_required status */}
          {toolResult && toolResult.status !== 'login_required' && (
            <pre className="mb-4 bg-gray-100 p-2 rounded text-xs max-w-md overflow-x-auto">{JSON.stringify(toolResult, null, 2)}</pre>
          )}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 border rounded-md">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="p-2 rounded-full bg-primary/20 text-primary"><Bot size={20} /></div>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="p-2 rounded-full bg-muted"><User size={20} /></div>
                )}
              </div>
            ))}
            {(isLoading || toolLoading) && (
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/20 text-primary"><Bot size={20} /></div>
                    <div className="rounded-lg px-4 py-2 max-w-xs bg-secondary flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </div>
          <div className="p-4 bg-background border-t-0 border rounded-b-md">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gemini anything..."
                  className="pr-12"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading}>
                  <CornerDownLeft size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function McpPage() {
  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="status"><Server className="w-4 h-4 mr-2"/>Status</TabsTrigger>
        <TabsTrigger value="tools"><Network className="w-4 h-4 mr-2"/>Tools</TabsTrigger>
        <TabsTrigger value="resources"><FileCode className="w-4 h-4 mr-2"/>Resources</TabsTrigger>
        <TabsTrigger value="chat"><MessageCircle className="w-4 h-4 mr-2"/>Gemini Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        <StatusTab />
      </TabsContent>
      <TabsContent value="tools">
        <ToolsTab />
      </TabsContent>
      {/* <TabsContent value="resources">
        <ResourcesTab />
      </TabsContent> */}
      <TabsContent value="chat">
        <GeminiChatTab />
      </TabsContent>
    </Tabs>
  );
}
