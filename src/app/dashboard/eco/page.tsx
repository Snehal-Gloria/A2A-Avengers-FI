"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recommendSpendingOptions, analyzeCarbonImpact } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { RecommendSpendingOptionsOutput } from "@/ai/flows/location-aware-spending-recommender";
import type { CarbonImpactOutput } from "@/ai/flows/carbon-impact-agent";
import { Leaf, MapPin, Search, Loader2 } from "lucide-react";

const mockSpendingData = JSON.stringify({
  spending: [
    { category: 'Groceries', amount: 300, merchant: 'BigMart' },
    { category: 'Dining Out', amount: 150, merchant: 'Steakhouse Supreme' },
    { category: 'Travel', amount: 200, transport_mode: 'Car' },
  ],
});


export default function EcoPage() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendSpendingOptionsOutput['recommendations']>([]);
  const [carbonAnalysis, setCarbonAnalysis] = useState<CarbonImpactOutput | null>(null);
  const [isRecoLoading, setIsRecoLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const handleRecommendationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRecoLoading(true);
    setRecommendations([]);
    const formData = new FormData(event.currentTarget);
    const location = formData.get("location") as string;
    const spendingCategory = formData.get("category") as string;
    const preferences = formData.get("preferences") as string;
    
    try {
      const result = await recommendSpendingOptions({ location, spendingCategory, preferences });
      setRecommendations(result.recommendations);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch recommendations." });
    } finally {
      setIsRecoLoading(false);
    }
  };

  const handleAnalysisClick = async () => {
    setIsAnalysisLoading(true);
    setCarbonAnalysis(null);
    try {
      const result = await analyzeCarbonImpact({ spendingData: mockSpendingData, location: "Bengaluru" });
      setCarbonAnalysis(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze carbon impact." });
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Eco-Friendly Recommendations</CardTitle>
          <CardDescription>Find sustainable spending options near you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecommendationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g., Bengaluru" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
               <Select name="category" defaultValue="food">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="preferences">Preferences (Optional)</Label>
              <Input id="preferences" name="preferences" placeholder="e.g., organic, local" />
            </div>
            <Button type="submit" disabled={isRecoLoading}>
              {isRecoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Find Options
            </Button>
          </form>
          {recommendations.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Here are some suggestions:</h3>
              {recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {rec.name}
                      {rec.sustainabilityScore && (
                        <span className="flex items-center text-sm font-medium text-green-600">
                          <Leaf className="mr-1 h-4 w-4" /> {rec.sustainabilityScore}/100
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center pt-1"><MapPin className="mr-1 h-4 w-4"/> {rec.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{rec.description}</p>
                    {rec.carbonImpact && <p className="text-sm mt-2"><strong>Carbon Impact:</strong> {rec.carbonImpact}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Carbon Impact Analysis</CardTitle>
          <CardDescription>Analyze your spending to understand your carbon footprint.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Get a detailed breakdown of your carbon footprint based on your recent transactions and receive suggestions for lower-carbon alternatives.</p>
            <Button onClick={handleAnalysisClick} disabled={isAnalysisLoading}>
              {isAnalysisLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Leaf className="mr-2 h-4 w-4" />}
              Analyze My Spending
            </Button>

            {carbonAnalysis && (
              <div className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{carbonAnalysis.analysis}</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">{carbonAnalysis.suggestions}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
