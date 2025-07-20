import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, IndianRupee, CreditCard, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/chatbot";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";

const spendingData = [
  { category: "Food", spent: 450, budget: 800, color: "hsl(var(--chart-1))" },
  { category: "Travel", spent: 200, budget: 300, color: "hsl(var(--chart-2))" },
  { category: "SIP", spent: 1000, budget: 1000, color: "hsl(var(--chart-3))" },
  { category: "Rent", spent: 1500, budget: 1500, color: "hsl(var(--chart-4))" },
  { category: "Bills", spent: 300, budget: 400, color: "hsl(var(--chart-5))" },
];

const netWorthData = [
    { month: "Jan", value: 50000 },
    { month: "Feb", value: 52000 },
    { month: "Mar", value: 55000 },
    { month: "Apr", value: 54000 },
    { month: "May", value: 58000 },
    { month: "Jun", value: 62000 },
];

const chartConfig = {
    value: { label: "Value" },
    spent: { label: "Spent", color: "hsl(var(--chart-1))" },
    budget: { label: "Budget", color: "hsl(var(--muted))" },
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ 5,42,318</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ 78,500</div>
          <p className="text-xs text-muted-foreground">from all sources</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Health</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">750</div>
          <p className="text-xs text-muted-foreground">CIBIL Score</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">A-</div>
          <p className="text-xs text-muted-foreground">Eco-friendly score</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
          <CardDescription>
            Your monthly spending against your budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spendingData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(item.spent / item.budget) * 100} className="w-24" />
                      <Badge variant={(item.spent / item.budget) > 0.9 ? "destructive" : "secondary"}>
                         {Math.round((item.spent / item.budget) * 100)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">₹{item.spent.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Financial Assistant</CardTitle>
          <CardDescription>
            Ask me anything about your finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Chatbot />
        </CardContent>
      </Card>

       <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
           <CardDescription>June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={spendingData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis hide/>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="spent" fill="var(--color-spent)" radius={4} />
              <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
       <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Net Worth Growth</CardTitle>
                <CardDescription>Your net worth over the last 6 months.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#">
                    Export Data
                    <FileDown className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <LineChart accessibilityLayer data={netWorthData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Line dataKey="value" type="natural" stroke="var(--color-spent)" strokeWidth={2} dot={true} />
              </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
