"use client"

import React, { useState } from 'react';
import { useTractionStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Plus,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { naturalLanguageTaskCreation } from '@/ai/flows/natural-language-task-creation';
import { toast } from '@/hooks/use-toast';

export default function Tasks() {
  const { tasks, addTask, toggleTask, removeTask } = useTractionStore();
  const [nlpInput, setNlpInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleNlpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput) return;
    setIsParsing(true);
    try {
      const res = await naturalLanguageTaskCreation({ naturalLanguageInput: nlpInput });
      addTask({
        name: res.taskName,
        dueDate: res.dueDate || format(new Date(), 'yyyy-MM-dd'),
        dueTime: res.dueTime || '',
        priority: res.priority || 'medium',
        isReminder: res.isReminder
      });
      setNlpInput('');
      toast({ 
        title: "Task Created", 
        description: `"${res.taskName}" added for ${res.dueDate || 'Today'}` 
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Couldn't parse that task. Try being more specific." });
    } finally {
      setIsParsing(false);
    }
  };

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Task Manager</h1>
        <p className="text-muted-foreground">Focus on what matters. TRACTION handles the rest.</p>
      </header>

      <Card className="rounded-3xl border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-1 overflow-hidden">
        <CardContent className="p-4 bg-background/5 backdrop-blur-md rounded-[1.4rem]">
          <form onSubmit={handleNlpSubmit} className="relative">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <Input 
              placeholder="e.g., Remind me to pay electric bill tomorrow at 6pm" 
              className="pl-12 pr-24 h-14 rounded-2xl bg-background border-none shadow-inner text-lg placeholder:text-muted-foreground/50"
              value={nlpInput}
              onChange={e => setNlpInput(e.target.value)}
              disabled={isParsing}
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-2 bottom-2 rounded-xl"
              disabled={isParsing || !nlpInput}
            >
              {isParsing ? "Parsing..." : "Add Task"}
            </Button>
          </form>
          <div className="mt-3 flex gap-4 px-4">
             <span className="text-xs text-primary-foreground/60 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Natural Language Parsing</span>
             <span className="text-xs text-primary-foreground/60 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto Calendar Sync</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Active Tasks ({activeTasks.length})</h2>
          <Button variant="ghost" size="sm">Clear all</Button>
        </div>

        <div className="space-y-3">
          {activeTasks.map(task => (
            <div 
              key={task.id} 
              className="group flex items-center gap-4 p-4 bg-card/40 backdrop-blur-sm border rounded-3xl hover:bg-card hover:shadow-lg transition-all"
            >
              <button onClick={() => toggleTask(task.id)} className="text-muted-foreground hover:text-primary transition-colors">
                <Circle className="w-6 h-6" />
              </button>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold">{task.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                  {task.dueTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.dueTime}</span>}
                  <span className={cn(
                    "flex items-center gap-1 uppercase tracking-wider",
                    task.priority === 'high' ? 'text-destructive' : task.priority === 'medium' ? 'text-amber-500' : 'text-green-500'
                  )}>
                    <AlertCircle className="w-3 h-3" /> {task.priority}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => removeTask(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl border-2 border-dashed">
              All caught up! Why not relax?
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <>
            <h2 className="text-xl font-bold pt-6 px-2 text-muted-foreground">Completed</h2>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-4 p-4 bg-secondary/10 rounded-3xl border border-transparent opacity-60"
                >
                  <button onClick={() => toggleTask(task.id)} className="text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium line-through">{task.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
