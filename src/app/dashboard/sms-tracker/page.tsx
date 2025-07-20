"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trackSmsTransactions } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { TrackSmsTransactionsOutput } from "@/ai/flows/sms-tracker-integration";
import { MessageSquare, IndianRupee, Tags, FileText, Loader2 } from "lucide-react";

export default function SmsTrackerPage() {
  const { toast } = useToast();
  const [transactionResult, setTransactionResult] = useState<TrackSmsTransactionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSmsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setTransactionResult(null);

    const formData = new FormData(event.currentTarget);
    const smsContent = formData.get("smsContent") as string;
    
    if (!smsContent.trim()) {
        toast({ variant: "destructive", title: "Error", description: "SMS content cannot be empty." });
        setIsLoading(false);
        return;
    }

    try {
      const result = await trackSmsTransactions({ smsContent });
      setTransactionResult(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not track transaction from SMS." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-0">
        <Card>
            <CardHeader>
                <CardTitle>SMS Transaction Tracker</CardTitle>
                <CardDescription>
                    Paste a financial SMS message below to automatically track the transaction.
                    <br/>
                    <strong className="text-destructive-foreground/70">Note: All processing happens locally or via secure AI. Your data is private.</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-8 md:grid-cols-2">
                    <form onSubmit={handleSmsSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="smsContent">SMS Content</Label>
                            <Textarea 
                                id="smsContent" 
                                name="smsContent" 
                                placeholder="e.g., Your a/c XXX123 is debited for Rs.250 on 20-06-24 and credited to VPA user@bank (UPI)" 
                                required 
                                className="min-h-[150px]"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                            Track Transaction
                        </Button>
                    </form>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
                        {isLoading ? (
                            <Card className="flex items-center justify-center min-h-[150px]">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </Card>
                        ) : transactionResult ? (
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Description</p>
                                            <p className="font-semibold">{transactionResult.transactionDescription}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <IndianRupee className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Amount</p>
                                            <p className="font-semibold">₹{transactionResult.transactionAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Tags className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Category</p>
                                            <p className="font-semibold capitalize">{transactionResult.transactionCategory.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="flex items-center justify-center min-h-[150px]">
                                <p className="text-muted-foreground">Parsed transaction details will appear here.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
