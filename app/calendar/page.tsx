"use client"

import React, { useState, useEffect } from 'react';
import { useTractionStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, ReceiptText, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

export default function CalendarPage() {
  const { expenses, tasks, addExpense, addTask } = useTractionStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<'expense' | 'task'>('expense');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const dayExpenses = expenses.filter(e => isSameDay(new Date(e.date), selectedDate));
  const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate));

  const resetDialog = () => {
    setEntryType('expense');
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseNote('');
    setTaskName('');
    setTaskTime('');
    setTaskPriority('medium');
  };

  const handleAddSomething = () => {
    if (entryType === 'expense') {
      const amount = Number(expenseAmount);

      if (!expenseCategory.trim() || Number.isNaN(amount) || amount <= 0) {
        toast({
          variant: 'destructive',
          title: 'Missing expense details',
          description: 'Add a category and a valid amount to save this expense.',
        });
        return;
      }

      addExpense({
        amount,
        category: expenseCategory.trim(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        note: expenseNote.trim(),
      });

      toast({
        title: 'Expense added',
        description: `Saved an expense on ${format(selectedDate, 'MMM d')}.`,
      });
    } else {
      if (!taskName.trim()) {
        toast({
          variant: 'destructive',
          title: 'Missing task name',
          description: 'Give the task a name before saving it.',
        });
        return;
      }

      addTask({
        name: taskName.trim(),
        dueDate: format(selectedDate, 'yyyy-MM-dd'),
        dueTime: taskTime,
        priority: taskPriority,
        isReminder: Boolean(taskTime),
      });

      toast({
        title: 'Task added',
        description: `Saved a task for ${format(selectedDate, 'MMM d')}.`,
      });
    }

    setIsAddDialogOpen(false);
    resetDialog();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and spending at a glance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-none shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
              <CardTitle className="text-2xl font-bold font-headline">{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={prevMonth}><ChevronLeft /></Button>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={nextMonth}><ChevronRight /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-4">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const hasExpenses = expenses.some(e => isSameDay(new Date(e.date), day));
                  const hasTasks = tasks.some(t => isSameDay(new Date(t.dueDate), day));
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-24 p-2 border-r border-b text-left flex flex-col justify-between transition-all duration-200 group relative",
                        !isSameMonth(day, monthStart) && "bg-secondary/20 opacity-30",
                        isSelected && "bg-primary/10 ring-2 ring-primary inset-0 z-10",
                        "hover:bg-primary/5"
                      )}
                    >
                      <span className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-xl font-semibold",
                        isToday(day) && "bg-primary text-primary-foreground",
                        isSelected && !isToday(day) && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex gap-1">
                        {hasExpenses && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        {hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                {isToday(selectedDate) && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Today</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-accent" />
                  Daily Expenses
                </h4>
                <div className="space-y-2">
                  {dayExpenses.length > 0 ? dayExpenses.map(e => (
                    <div key={e.id} className="p-3 bg-secondary/30 rounded-2xl flex justify-between items-center group">
                      <div>
                        <p className="font-semibold text-sm">{e.category}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{e.note}</p>
                      </div>
                      <span className="font-bold text-accent">₹{e.amount}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground italic">No expenses for this day.</p>}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Tasks & Reminders
                </h4>
                <div className="space-y-2">
                  {dayTasks.length > 0 ? dayTasks.map(t => (
                    <div key={t.id} className="p-3 bg-secondary/30 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.dueTime || 'All Day'}</p>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      )} />
                    </div>
                  )) : <p className="text-sm text-muted-foreground italic">No tasks for this day.</p>}
                </div>
              </section>

              <Button
                className="w-full rounded-2xl mt-4 border-dashed border-2 bg-transparent text-muted-foreground hover:bg-secondary/50 h-12"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add something
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetDialog();
          }
        }}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add something on {format(selectedDate, 'MMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              Quickly add either an expense or a task from the calendar sidebar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={entryType === 'expense' ? 'default' : 'outline'}
              className="rounded-2xl"
              onClick={() => setEntryType('expense')}
            >
              <ReceiptText className="w-4 h-4 mr-2" />
              Expense
            </Button>
            <Button
              type="button"
              variant={entryType === 'task' ? 'default' : 'outline'}
              className="rounded-2xl"
              onClick={() => setEntryType('task')}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Task
            </Button>
          </div>

          {entryType === 'expense' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Input
                  id="expense-category"
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  placeholder="Food, Travel, Bills..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-note">Note</Label>
                <Textarea
                  id="expense-note"
                  value={expenseNote}
                  onChange={e => setExpenseNote(e.target.value)}
                  placeholder="Optional note for this expense"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task name</Label>
                <Input
                  id="task-name"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  placeholder="Pay rent, doctor reminder..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-time">Time</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(priority => (
                    <Button
                      key={priority}
                      type="button"
                      variant={taskPriority === priority ? 'default' : 'outline'}
                      className="rounded-2xl capitalize"
                      onClick={() => setTaskPriority(priority)}
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-2xl" onClick={handleAddSomething}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
