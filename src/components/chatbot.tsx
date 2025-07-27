"use client";

import { useState, useEffect } from 'react';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { connectToServer, getStatus, callTool } from '@/lib/mcp-api';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type AgentKey = 'personal_financial_advisor' | 'smart_budget_optimizer' | 'investment_portfolio_manager' | 'wealth_growth_tracker' | 'risk_assessment';

const AGENTS: { key: AgentKey; label: string; description: string }[] = [
  { key: 'personal_financial_advisor', label: 'Personal Financial Advisor', description: 'Comprehensive financial health and action plan.' },
  { key: 'smart_budget_optimizer', label: 'Smart Budget Optimizer', description: 'Budget analysis and savings recommendations.' },
  { key: 'investment_portfolio_manager', label: 'Investment Portfolio Manager', description: 'Portfolio review and investment advice.' },
  { key: 'wealth_growth_tracker', label: 'Wealth Growth Tracker', description: 'Track and project your wealth growth.' },
  { key: 'risk_assessment', label: 'Risk Assessment', description: 'Analyze financial risks and stability.' },
];

// Tool mapping from your table
const TOOL_MAP: Record<AgentKey, { name: string; priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' }[]> = {
  personal_financial_advisor: [
    { name: 'fetch_net_worth', priority: 'PRIMARY' },
    { name: 'fetch_bank_transactions', priority: 'PRIMARY' },
    { name: 'fetch_credit_report', priority: 'SECONDARY' },
    { name: 'fetch_mf_transactions', priority: 'SECONDARY' },
    { name: 'fetch_stock_transactions', priority: 'SECONDARY' },
    { name: 'fetch_epf_details', priority: 'SECONDARY' },
  ],
  smart_budget_optimizer: [
    { name: 'fetch_bank_transactions', priority: 'PRIMARY' },
    { name: 'fetch_net_worth', priority: 'SECONDARY' },
    { name: 'fetch_credit_report', priority: 'TERTIARY' },
  ],
  investment_portfolio_manager: [
    { name: 'fetch_mf_transactions', priority: 'PRIMARY' },
    { name: 'fetch_stock_transactions', priority: 'PRIMARY' },
    { name: 'fetch_net_worth', priority: 'SECONDARY' },
  ],
  wealth_growth_tracker: [
    { name: 'fetch_net_worth', priority: 'PRIMARY' },
    { name: 'fetch_bank_transactions', priority: 'SECONDARY' },
    { name: 'fetch_mf_transactions', priority: 'TERTIARY' },
    { name: 'fetch_stock_transactions', priority: 'TERTIARY' },
  ],
  risk_assessment: [
    { name: 'fetch_credit_report', priority: 'PRIMARY' },
    { name: 'fetch_bank_transactions', priority: 'PRIMARY' },
    { name: 'fetch_net_worth', priority: 'SECONDARY' },
    { name: 'fetch_mf_transactions', priority: 'TERTIARY' },
    { name: 'fetch_stock_transactions', priority: 'TERTIARY' },
    { name: 'fetch_epf_details', priority: 'TERTIARY' },
  ],
};



const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey>('personal_financial_advisor');
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:8000');

  // User context (now includes phone number, can be dynamic)
  const [userContext, setUserContext] = useState({
    name: 'Rahul',
    age: 28,
    occupation: 'Software Engineer',
    city: 'Bangalore',
    phone: '', // will be fetched automatically
  });

  // On mount, check MCP connection status and fetch phone
  useEffect(() => {
    const checkStatusAndFetchPhone = async () => {
      try {
        const status = await getStatus();
        setIsConnected(status.connected);
        setServerUrl(status.server_url || 'http://localhost:8000');
      } catch {}
      try {
        const res = await axios.get('http://localhost:8000/user/profile');
        if (res.data && res.data.phone) {
          setUserContext(prev => ({ ...prev, phone: res.data.phone }));
        }
      } catch {}
    };
    checkStatusAndFetchPhone();
  }, []);

  // Connect to MCP server if not connected
  const handleConnect = async () => {
    try {
      const response = await connectToServer(serverUrl);
      setIsConnected(true);
      setServerUrl(serverUrl);
      toast({ title: 'Success', description: response.message });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Failed to connect' });
    }
  };

  // Fetch tool URLs for the selected agent
  // Fetch user-specific tool data from fi-mcp
  // Fetch tool data using MCP tool call logic
  const fetchToolData = async (agent: AgentKey, phone: string) => {
    const tools = TOOL_MAP[agent];
    const results: { name: string; priority: string; data: any }[] = [];
    for (const tool of tools) {
      try {
        // Use MCP tool call logic
        const args = phone ? { phone } : {};
        const response = await callTool(tool.name, args);
        if (response.login_required && response.login_url) {
          results.push({ name: tool.name, priority: tool.priority, data: { login_url: response.login_url } });
        } else if (response.result) {
          results.push({ name: tool.name, priority: tool.priority, data: response.result });
        } else {
          results.push({ name: tool.name, priority: tool.priority, data: { error: 'No result returned' } });
        }
      } catch (err: any) {
        results.push({ name: tool.name, priority: tool.priority, data: { error: err.message } });
      }
    }
    return results;
  };

  // Build LLM prompt
  const buildPrompt = (
    agent: AgentKey,
    scenario: string,
    toolData: { name: string; priority: string; data: any }[],
    userQuery: string
  ) => {
    // Mask PII
    const maskedName = userContext.name ? userContext.name[0] + "***" : "";
    const maskedPhone = userContext.phone ? userContext.phone.slice(0, 2) + "******" + userContext.phone.slice(-2) : "";

    let prompt = `User: ${maskedName} (${userContext.age}, ${userContext.occupation}, ${userContext.city}, phone: ${maskedPhone})\nScenario: ${scenario}\n`;
    prompt += `Agent: ${AGENTS.find(a => a.key === agent)?.label}\n`;
    prompt += `Relevant Data (by priority):\n`;
    for (const t of toolData) {
      prompt += `- ${t.name} (${t.priority}): ${JSON.stringify(t.data)}\n`;
    }
    prompt += `\nUser Query: ${userQuery}\n`;
    prompt += `\nGenerate a response strictly based on the above MCP user data, in the style of the provided agent examples. Mask any personal identifiers in your answer.`;
    return prompt;
  };

  // Simulate scenario based on agent
  const getScenario = (agent: AgentKey) => {
    switch (agent) {
      case 'personal_financial_advisor':
        return 'User opens their financial dashboard for a weekly review.';
      case 'smart_budget_optimizer':
        return 'User requests a budget optimization based on recent transactions.';
      case 'investment_portfolio_manager':
        return 'User asks for an investment portfolio review after market changes.';
      case 'wealth_growth_tracker':
        return 'User wants to track and project their wealth growth over time.';
      case 'risk_assessment':
        return 'User requests a comprehensive financial risk assessment.';
      default:
        return 'User interacts with their financial assistant.';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgent(e.target.value as AgentKey);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Fetch user-specific tool data for selected agent
      const toolData = await fetchToolData(selectedAgent, userContext.phone);
      // 2. Build prompt for LLM
      const scenario = getScenario(selectedAgent);
      const prompt = buildPrompt(selectedAgent, scenario, toolData, input);
      // 3. Call LLM backend using /query endpoint
      const response = await axios.post('http://localhost:8000/query', { query: prompt });
      if (response.data && response.data.response) {
        const assistantMessage: Message = { role: 'assistant', content: response.data.response };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: No answer returned from LLM.' }]);
      }
    } catch (error: any) {
      let errorMsg = 'There was a problem with the AI Assistant.';
      if (error.response && error.response.data) {
        errorMsg += '\nDetails: ' + JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg += '\nDetails: ' + error.message;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* MCP Connection UI */}
        <div className="mb-4 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>{isConnected ? `Connected to ${serverUrl}` : 'Not Connected'}</span>
          {!isConnected && (
            <Button onClick={handleConnect} size="sm">Connect MCP</Button>
          )}
        </div>
        {/* Agent selection UI */}
        <div className="mb-4">
          <label htmlFor="agent-select" className="font-semibold mr-2">Select Agent:</label>
            <select
            id="agent-select"
            value={selectedAgent}
            onChange={handleAgentChange}
            className="border rounded px-2 py-1 bg-gray-100 text-black"
            >
            {AGENTS.map(agent => (
              <option key={agent.key} value={agent.key}>{agent.label}</option>
            ))}
            </select>
          <span className="ml-3 text-xs text-muted-foreground">{AGENTS.find(a => a.key === selectedAgent)?.description}</span>
        </div>
        {/* User phone input (auto-filled, editable if needed) */}
        <div className="mb-4">
          <label htmlFor="user-phone" className="font-semibold mr-2">User Phone:</label>
          <input
            id="user-phone"
            type="text"
            value={userContext.phone}
            onChange={e => setUserContext({ ...userContext, phone: e.target.value })}
            className="border rounded px-2 py-1 "
            placeholder="Enter phone number"
            autoComplete="tel"
          />
          <span className="ml-3 text-xs text-muted-foreground">(Auto-fetched from profile, editable)</span>
        </div>
        {/* Chatbot messages */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="p-2 rounded-full bg-primary/20 text-primary">
                <Bot size={20} />
              </div>
            )}
            <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown components={{
                  p: ({node, ...props}) => <p className="text-sm leading-relaxed" {...props} />
                }}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="p-2 rounded-full bg-muted">
                <User size={20} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                    <Bot size={20} />
                </div>
                <div className="rounded-lg px-4 py-2 max-w-xs bg-secondary flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            </div>
        )}
      </CardContent>
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a financial question..."
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
  );
};

export default Chatbot;