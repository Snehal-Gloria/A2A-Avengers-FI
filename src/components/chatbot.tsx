"use client";

import { useState } from 'react';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { financialInsightAgent } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast"
import axios from "axios";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const mockFinancialData = JSON.stringify({
  netWorth: 542318,
  monthlyIncome: 78500,
  spending: {
    Food: 450,
    Travel: 200,
    SIP: 1000,
    Rent: 1500,
    Bills: 300,
  },
  creditScore: 750,
});


export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Net worth tool states
  const [netWorthResult, setNetWorthResult] = useState<any>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [netWorthLoading, setNetWorthLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await financialInsightAgent({
        query: input,
        financialData: mockFinancialData
      });
      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with the AI Assistant. Please try again.",
      });
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  // Net worth tool logic
  const callNetWorthTool = async () => {
    setNetWorthLoading(true);
    setNetWorthResult(null);
    setLoginUrl(null);
    try {
      const res = await axios.post("http://localhost:8000/tools/call", {
        tool_name: "fetch_net_worth"
      });
      if (res.data.login_required && res.data.login_url) {
        setLoginUrl(res.data.login_url);
      } else {
        setNetWorthResult(res.data.result);
      }
    } catch (err: any) {
      setNetWorthResult({ error: err.message });
    }
    setNetWorthLoading(false);
  };

  const handleNetWorthQuery = async () => {
    setNetWorthLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/query", {
        query: "whats my net worth?"
      });
      setNetWorthResult(res.data.response);
    } catch (err: any) {
      setNetWorthResult({ error: err.message });
    }
    setNetWorthLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* Chatbot messages */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="p-2 rounded-full bg-primary/20 text-primary">
                <Bot size={20} />
              </div>
            )}
            <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <p className="text-sm">{msg.content}</p>
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
        {/* Net Worth Tool UI */}
        <div className="mt-4">
          <Button onClick={callNetWorthTool} disabled={netWorthLoading}>
            Check Net Worth
          </Button>
          {loginUrl && (
            <div className="mt-2">
              <p>
                Please{' '}
                <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">login here</a>
                {' '}and then click below:
              </p>
              <Button onClick={handleNetWorthQuery} disabled={netWorthLoading} className="mt-2">
                Continue
              </Button>
            </div>
          )}
          {netWorthResult && (
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs max-w-md overflow-x-auto">{JSON.stringify(netWorthResult, null, 2)}</pre>
          )}
        </div>
      </CardContent>
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="E.g., How can I save more?"
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
}