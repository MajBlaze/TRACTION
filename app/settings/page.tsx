"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTractionTheme } from '@/components/ThemeContext';
import { useTractionStore } from '@/lib/store';
import { useUser } from '@/auth';
import { 
  Palette, 
  Moon, 
  Sun, 
  User, 
  Bell, 
  Shield, 
  Database,
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SettingsTab = 'appearance' | 'profile' | 'notifications' | 'security' | 'data';

export default function Settings() {
  const { mode, accent, toggleMode, setAccent } = useTractionTheme();
  const { budget, setBudget, resetData } = useTractionStore();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      resetData();
      toast({ title: "Data cleared", description: "Your saved app data has been reset." });
    }
  };

  const navItems: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Personalize your TRACTION experience.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
           <nav className="space-y-1">
             {navItems.map((item) => (
               <Button 
                key={item.id}
                variant="ghost" 
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full justify-start gap-3 rounded-xl transition-all",
                  activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                )}
               >
                 <item.icon className="w-4 h-4" /> {item.label}
               </Button>
             ))}
           </nav>
        </div>

        <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'appearance' && (
            <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Change the look and feel of the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Enable dark theme for eye comfort.</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl border" onClick={toggleMode}>
                    {mode === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { id: 'default', color: '#6889FF', label: 'Classic' },
                      { id: 'blue', color: '#3b82f6', label: 'Ocean' },
                      { id: 'green', color: '#10b981', label: 'Emerald' },
                      { id: 'purple', color: '#8b5cf6', label: 'Royal' },
                      { id: 'orange', color: '#f97316', label: 'Sunset' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setAccent(t.id as any)}
                        className={`flex flex-col items-center gap-2 group`}
                      >
                        <div 
                          className={`w-full aspect-square rounded-2xl border-4 transition-all ${accent === t.id ? 'border-primary shadow-lg ring-4 ring-primary/20' : 'border-transparent'}`}
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Manage your public information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={user?.username ?? ''} readOnly className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user?.email ?? ''} disabled className="rounded-xl" />
                </div>
                <Button className="rounded-xl" onClick={() => toast({ title: "Profile details are synced from signup" })}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Expense Reminders</Label>
                    <p className="text-xs text-muted-foreground">Daily notification to log your spending.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-xs text-muted-foreground">Notify me when I reach 80% of my budget.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Due Dates</Label>
                    <p className="text-xs text-muted-foreground">Remind me when tasks are nearing their deadline.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Secure your account and financial data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl" />
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => toast({ title: "Security settings saved" })}>Update Password</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your financial limits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Monthly Budget Goal (₹)</Label>
                    <Input 
                      type="number" 
                      value={budget} 
                      onChange={(e) => setBudget(Number(e.target.value))} 
                      className="rounded-xl h-12 text-lg font-bold"
                    />
                    <p className="text-xs text-muted-foreground italic">Your dashboard will use this to calculate progress.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-destructive/20 shadow-xl bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Permanent actions that cannot be reversed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-destructive/10">
                    <div>
                      <p className="font-bold text-sm">Delete All Data</p>
                      <p className="text-xs text-muted-foreground">Wipes local storage and state.</p>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleClearData}>
                      <Trash2 className="w-4 h-4 mr-2" /> Reset App
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
