"use client"

import React, { useState } from 'react';
import { useTractionStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  ArrowRight, 
  Copy, 
  LogOut, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

export default function Groups() {
  const { groups, addGroup, joinGroup, expenses } = useTractionStore();
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newGroupName) return;
    addGroup(newGroupName);
    setNewGroupName('');
    toast({ title: "Group Created", description: `You have successfully created ${newGroupName}` });
  };

  const handleJoin = () => {
    if (!joinCode) return;
    joinGroup(joinCode);
    setJoinCode('');
    toast({ title: "Group Joined", description: `You joined the group!` });
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);
  const groupExpenses = expenses.filter(e => e.groupId === selectedGroup);
  const totalGroupSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = currentGroup ? totalGroupSpent / currentGroup.members.length : 0;

  return (
    <div className="space-y-8">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Split Groups</h1>
          <p className="text-muted-foreground">Split bills equally with friends and family.</p>
        </div>
        <div className="flex gap-2">
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl">Join Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join a Group</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Enter 6-digit code" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                <Button onClick={handleJoin} className="w-full">Join Now</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Shared Group</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Group name (e.g. Goa Trip)" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                <Button onClick={handleCreate} className="w-full">Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {!selectedGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Card key={group.id} className="rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-card/40 backdrop-blur-md overflow-hidden" onClick={() => setSelectedGroup(group.id)}>
              <CardHeader className="bg-primary/5 pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-lg uppercase tracking-widest">{group.code}</span>
                </div>
                <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">{group.name}</CardTitle>
                <CardDescription>{group.members.length} members involved</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Your Balance</p>
                   <p className="text-lg font-bold text-green-500">+ ₹0.00</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-card/20 rounded-3xl border-2 border-dashed">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">You are not part of any groups yet.</p>
              <Button variant="ghost">Get Started</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedGroup(null)} className="rounded-xl mb-4">
            <ChevronRight className="w-4 h-4 rotate-180 mr-2" /> Back to all groups
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl">{currentGroup?.name}</CardTitle>
                    <div className="flex gap-2">
                       <Button variant="secondary" size="icon" className="rounded-xl" onClick={() => {
                         navigator.clipboard.writeText(currentGroup?.code || '');
                         toast({ title: "Copied!", description: "Invite code copied to clipboard." });
                       }}><Copy className="w-4 h-4" /></Button>
                       <Button variant="secondary" size="icon" className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <CardDescription className="text-primary-foreground/80">Group Code: {currentGroup?.code}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <div className="p-4 bg-secondary/30 rounded-2xl">
                       <p className="text-xs font-bold text-muted-foreground uppercase">Total Group Spend</p>
                       <p className="text-2xl font-bold">₹{totalGroupSpent.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-secondary/30 rounded-2xl">
                       <p className="text-xs font-bold text-muted-foreground uppercase">Per Person</p>
                       <p className="text-2xl font-bold">₹{perPerson.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                       <p className="text-xs font-bold text-green-500 uppercase">You Get Back</p>
                       <p className="text-2xl font-bold text-green-500">₹0.00</p>
                     </div>
                   </div>

                   <h3 className="font-bold text-lg mb-4">Shared Expenses</h3>
                   <div className="space-y-4">
                     {groupExpenses.length === 0 ? (
                       <p className="text-muted-foreground italic text-center py-8">No shared expenses added yet.</p>
                     ) : (
                       groupExpenses.map(e => (
                         <div key={e.id} className="flex justify-between items-center p-4 bg-secondary/20 rounded-2xl">
                            <div>
                              <p className="font-bold">{e.note}</p>
                              <p className="text-xs text-muted-foreground">Paid by You • 1/1 shared</p>
                            </div>
                            <span className="text-lg font-bold text-primary">₹{e.amount}</span>
                         </div>
                       ))
                     )}
                     <Button variant="outline" className="w-full border-dashed rounded-2xl h-12">
                       <Plus className="w-4 h-4 mr-2" /> Add a bill
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
               <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md">
                 <CardHeader><CardTitle className="text-lg">Group Members</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    {currentGroup?.members.map((member, index) => (
                      <div key={`${member}-${index}`} className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                           {member[0]}
                         </div>
                         <div className="flex-1">
                           <p className="font-semibold text-sm">{member}</p>
                           <p className="text-xs text-muted-foreground">{member === 'You' ? 'Group Admin' : 'Member'}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-muted-foreground">Settled</p>
                            <UserCheck className="w-4 h-4 text-green-500 ml-auto" />
                         </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-primary mt-4">Invite more friends</Button>
                 </CardContent>
               </Card>

               <Card className="rounded-3xl border-none shadow-xl bg-card/40 backdrop-blur-md p-6">
                 <h3 className="font-bold text-lg mb-2">How it works</h3>
                 <p className="text-sm text-muted-foreground">TRACTION splits every shared bill equally among all members. When you add a bill, everyone is notified of their share.</p>
                 <Button className="mt-4 w-full rounded-xl" variant="secondary">Manage Settlements</Button>
               </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
