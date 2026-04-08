
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useTractionStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Target, 
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#6889FF', '#60CFF9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function generateSimpleInsights(
  expenses: { category: string; amount: number; date: string; note: string }[],
  budget: number
) {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const grouped = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.amount;
    return acc;
  }, {});
  const topCategory = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
  const budgetLeft = budget - totalSpent;

  return {
    insights:
      totalSpent > 0
        ? `You have spent about Rs. ${Math.round(totalSpent)} so far this month. This gives you a clearer picture of how your money is moving day by day. ${budgetLeft >= 0 ? `You still have around Rs. ${Math.round(budgetLeft)} left in your budget, so you still have some room for planned spending.` : `You are over budget by around Rs. ${Math.round(Math.abs(budgetLeft))}, which means your recent spending has moved faster than your budget plan.`} Looking at this early can help you make better decisions before the month gets harder to manage.`
        : 'You have not added enough expenses yet.',
    spendingAnalysis: topCategory
      ? `Most of your spending is in ${topCategory[0]} at about Rs. ${Math.round(topCategory[1])}. This looks like your biggest cost area right now and is probably shaping your overall budget the most. If this category keeps growing, it may become harder to stay balanced in other areas. Even a small cut here could make the biggest difference and give you more control over the rest of the month.`
      : 'There is not enough data yet to find your main spending area.',
    budgetingAdvice:
      budgetLeft >= 0
        ? 'Try to keep your next few purchases small and focus on the things you really need. This is a good time to stay disciplined while you still have budget left. If you continue at this pace, you will have a better chance of finishing the month comfortably under budget. Small careful choices now can protect you from stress later.'
        : 'Try to reduce spending in your biggest category for a few days and track every purchase carefully. This will help you spot what can be delayed, avoided, or replaced with a cheaper option. You do not need to change everything at once, just start with the biggest spending area. A few better choices now can help you recover control step by step.',
  };
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    let startTime: number | null = null;
    let frameId = 0;
    let isActive = true;
    const duration = 1000;
    const startValue = prevValue.current;
    
    const animate = (timestamp: number) => {
      if (!isActive) return;
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (value - startValue) + startValue);
      setDisplayValue(current);
      
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };
    
    frameId = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      cancelAnimationFrame(frameId);
    };
  }, [value]);

  return <span>₹{displayValue.toLocaleString()}</span>;
};

export default function Dashboard() {
  const { expenses, budget, setBudget } = useTractionStore();
  const [insights, setInsights] = useState<{ insights: string, spendingAnalysis: string, budgetingAdvice: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = Math.max(0, budget - totalExpenses);
  const spendingPercentage = Math.min(100, (totalExpenses / budget) * 100);

  useEffect(() => {
    setTempBudget(budget.toString());
  }, [budget]);

  // Chart Data
  const categoryData = expenses.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  const dailyData = expenses.reduce((acc: any[], curr) => {
    const date = new Date(curr.date).toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(a => a.name === date);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: date, value: curr.amount });
    }
    return acc;
  }, []).slice(-7);

  const getInsights = async () => {
    if (expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "No expenses to analyze",
        description: "Add a few expenses first, then try again.",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      setInsights(
        generateSimpleInsights(
          expenses.map(e => ({
            category: e.category,
            amount: e.amount,
            date: e.date,
            note: e.note
          })),
          budget
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis unavailable",
        description: "Something went wrong while creating your summary.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateBudget = () => {
    const newBudget = Number(tempBudget);
    if (isNaN(newBudget) || newBudget <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Budget",
        description: "Please enter a valid positive number."
      });
      return;
    }
    setBudget(newBudget);
    setIsBudgetDialogOpen(false);
    toast({
      title: "Budget Updated",
      description: `Monthly budget set to ₹${newBudget.toLocaleString()}`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back</h1>
          <p className="text-muted-foreground">Here's what's happening with your money today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/expenses">
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-foreground/80 font-medium">Total Expenses</p>
                <h2 className="text-4xl font-bold mt-1">
                  <AnimatedNumber value={totalExpenses} />
                </h2>
              </div>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Budget Progress</span>
                <span>{spendingPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={spendingPercentage} className="h-2 bg-white/20" />
            </div>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet size={120} />
          </div>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-card/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground font-medium">Monthly Budget</p>
                <h2 className="text-4xl font-bold mt-1">
                  <AnimatedNumber value={budget} />
                </h2>
              </div>
              <div className="p-2 bg-accent/20 text-accent rounded-xl">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Set goal for this month.
            </p>
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto mt-4 text-primary hover:text-primary/80 hover:bg-transparent">
                  Adjust Budget <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Adjust Monthly Budget</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget Goal (₹)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      placeholder="Enter amount"
                      className="rounded-xl h-12 text-lg font-bold"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleUpdateBudget} className="rounded-xl">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-card/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground font-medium">Remaining Balance</p>
                <h2 className="text-4xl font-bold mt-1">
                  <AnimatedNumber value={remainingBalance} />
                </h2>
              </div>
              <div className="p-2 bg-green-500/20 text-green-500 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {remainingBalance > 0 ? "You're under budget! Good job." : "You've exceeded your budget!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl shadow-lg border-none bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="rounded-2xl shadow-lg border-none bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="truncate">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border-none bg-card/40 backdrop-blur-sm overflow-hidden">
               <CardHeader className="bg-primary/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Smart Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">
                  {expenses.length > 0 
                    ? `You spent the most on ${[...categoryData].sort((a,b) => b.value - a.value)[0]?.name || 'N/A'} this month. Consider reducing this by 10% to save ₹${(totalExpenses * 0.1).toFixed(0)}.`
                    : "Add some expenses to see smart insights about your spending habits."}
                </p>
                <Button variant="link" className="p-0 h-auto mt-4 text-primary">Learn more</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Financial Coach */}
        <div className="space-y-8">
          <Card className="rounded-2xl shadow-xl border-none bg-gradient-to-br from-card to-background ring-1 ring-primary/10 overflow-hidden">
            <CardHeader className="border-b bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Simple Coach Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!insights ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="font-semibold mb-2">Get Personalized Coaching</h3>
                  <p className="text-sm text-muted-foreground mb-6">Get a short and simple money summary made for beginners.</p>
                  <Button 
                    onClick={getInsights} 
                    disabled={isAnalyzing || expenses.length === 0}
                    className="w-full rounded-xl"
                  >
                    {isAnalyzing ? "Analyzing..." : "Generate Simple Analysis"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-2">Quick Summary</h4>
                    <p className="text-sm leading-relaxed">{insights.insights}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-2">Main Spending Area</h4>
                    <p className="text-sm leading-relaxed">{insights.spendingAnalysis}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-2">Simple Advice</h4>
                    <p className="text-sm leading-relaxed italic">"{insights.budgetingAdvice}"</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => setInsights(null)}>Reset Analysis</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
