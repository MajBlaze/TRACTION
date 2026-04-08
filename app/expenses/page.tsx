"use client"

import React, { useState } from 'react';
import { useTractionStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Calendar as CalendarIcon,
  Tag,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { smartExpenseCategorization } from '@/ai/flows/smart-expense-categorization';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const categories = ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Groceries', 'Travel', 'Personal Care', 'Insurance', 'Investments', 'Salary', 'Other'];

export default function Expenses() {
  const { expenses, addExpense, removeExpense } = useTractionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Other',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredExpenses = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.note.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;
    addExpense({
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      note: newExpense.note
    });
    setNewExpense({ amount: '', category: 'Other', date: format(new Date(), 'yyyy-MM-dd'), note: '' });
    setIsDialogOpen(false);
    toast({ title: "Expense Added", description: `Added ₹${newExpense.amount} for ${newExpense.category}` });
  };

  const suggestCategory = async () => {
    if (!newExpense.note) return;
    setIsSuggesting(true);
    try {
      const res = await smartExpenseCategorization({ description: newExpense.note });
      setNewExpense(prev => ({ ...prev, category: res.category }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Note'];
    const rows = expenses.map(e => [e.date, e.category, e.amount, e.note]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "traction_expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Expenses</h1>
          <p className="text-muted-foreground">Keep track of every penny you spend.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newExpense.amount} 
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    required
                    className="rounded-xl h-12 text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Note / Description</label>
                  <div className="relative">
                    <Textarea 
                      placeholder="What was this for?" 
                      value={newExpense.note}
                      onChange={e => setNewExpense({...newExpense, note: e.target.value})}
                      className="rounded-xl min-h-[100px] pr-10"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 bottom-2 text-primary hover:bg-primary/10"
                      onClick={suggestCategory}
                      disabled={isSuggesting || !newExpense.note}
                      title="Auto-suggest category"
                    >
                      <Sparkles className={cn("w-5 h-5", isSuggesting && "animate-spin")} />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      type="date" 
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl mt-4 font-bold">Save Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/40 p-2 rounded-2xl border mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search expenses..." 
            className="pl-10 rounded-xl border-none bg-transparent focus-visible:ring-0" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="rounded-2xl overflow-hidden border-none shadow-xl bg-card/40 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-primary/5">
                  <TableCell className="font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic truncate max-w-xs">{expense.note}</TableCell>
                  <TableCell className="text-right font-bold text-lg">₹{expense.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No expenses found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="rounded-2xl border-none shadow-md bg-card/40 backdrop-blur-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">₹{expense.amount.toLocaleString()}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="w-3 h-3" /> {expense.category}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3 h-3" /> {format(new Date(expense.date), 'MMM dd')}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive rounded-lg"
                onClick={() => removeExpense(expense.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
