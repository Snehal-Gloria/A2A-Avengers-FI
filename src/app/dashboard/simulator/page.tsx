"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { opportunityCostSimulator } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { OpportunityCostSimulatorOutput } from "@/ai/flows/opportunity-cost-simulator";
import { TrendingUp, TrendingDown, IndianRupee, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

export default function SimulatorPage() {
  const { toast } = useToast();
  const [simulationResult, setSimulationResult] = useState<OpportunityCostSimulatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSimulationResult(null);

    const formData = new FormData(event.currentTarget);
    const spendingDecision = formData.get("spendingDecision") as string;
    const currentSavings = parseFloat(formData.get("currentSavings") as string);
    const investmentReturnRate = parseFloat(formData.get("investmentReturnRate") as string) / 100;
    const simulationYears = parseInt(formData.get("simulationYears") as string);

    if (isNaN(currentSavings) || isNaN(investmentReturnRate) || isNaN(simulationYears)) {
        toast({ variant: "destructive", title: "Error", description: "Please enter valid numbers." });
        setIsLoading(false);
        return;
    }

    try {
      const result = await opportunityCostSimulator({ spendingDecision, currentSavings, investmentReturnRate, simulationYears });
      setSimulationResult(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not run simulation." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const chartData = simulationResult ? [
      { name: 'With Decision', value: simulationResult.projectedSavings },
      { name: 'Without Decision', value: simulationResult.projectedSavings + simulationResult.opportunityCost },
  ] : [];

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Opportunity Cost Simulator</CardTitle>
          <CardDescription>See the future impact of your financial decisions today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSimulationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spendingDecision">Financial Decision</Label>
              <Textarea id="spendingDecision" name="spendingDecision" placeholder="e.g., Increase SIP by ₹2000/month, or rent a home at ₹50K/month" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings (₹)</Label>
              <Input id="currentSavings" name="currentSavings" type="number" placeholder="50000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentReturnRate">Estimated Annual Return (%)</Label>
              <Input id="investmentReturnRate" name="investmentReturnRate" type="number" placeholder="8" step="0.1" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="simulationYears">Simulation Years</Label>
              <Input id="simulationYears" name="simulationYears" type="number" placeholder="5" required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Simulate Future
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-3 space-y-8">
        {simulationResult && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
                <CardDescription>Based on a {simulationResult.projectedSavings ? `${(document.getElementById('simulationYears') as HTMLInputElement).value}-year` : ''} projection.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Card className="flex flex-col justify-between p-4">
                        <div className="flex items-center text-muted-foreground">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            <h3 className="text-sm font-semibold">Projected Savings</h3>
                        </div>
                        <p className="text-2xl font-bold mt-2">₹{simulationResult.projectedSavings.toLocaleString('en-IN')}</p>
                    </Card>
                </div>
                <div className="space-y-2">
                     <Card className="flex flex-col justify-between p-4">
                        <div className="flex items-center text-muted-foreground">
                            <TrendingDown className="h-5 w-5 mr-2" />
                            <h3 className="text-sm font-semibold">Opportunity Cost</h3>
                        </div>
                        <p className="text-2xl font-bold mt-2">₹{simulationResult.opportunityCost.toLocaleString('en-IN')}</p>
                    </Card>
                </div>
                <div className="sm:col-span-2 space-y-2">
                    <Card className="flex flex-col justify-between p-4">
                        <div className="flex items-center text-muted-foreground">
                            <IndianRupee className="h-5 w-5 mr-2" />
                            <h3 className="text-sm font-semibold">AI Insights</h3>
                        </div>
                        <p className="text-sm mt-2">{simulationResult.insights}</p>
                    </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visual Comparison</CardTitle>
                    <CardDescription>Projected savings with and without the financial decision.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${Number(value)/1000}k`} />
                            <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                            <Legend />
                            <Bar dataKey="value" name="Projected Savings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </>
        )}
        {!simulationResult && !isLoading && (
            <Card className="lg:col-span-3 flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                    <p>Your simulation results will appear here.</p>
                </div>
            </Card>
        )}
         {isLoading && (
            <Card className="lg:col-span-3 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        )}
      </div>
    </div>
  );
}
