'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { SupportTicket } from '@/types/database';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Plus } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function SupportPage() {
    const { clientId, isLoading: clientLoading } = useClient();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [creating, setCreating] = useState(false);
    const { toast } = useToast();

    // Form state
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchTickets();
            subscribeToTickets();
        }
    }, [clientId, clientLoading]);

    const fetchTickets = async () => {
        if (!clientId) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToTickets = () => {
        if (!clientId) return;

        const supabase = createClient();
        const channel = supabase
            .channel('support_tickets_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'support_tickets',
                    filter: `client_id=eq.${clientId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTickets((prev) => [payload.new as SupportTicket, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTickets((prev) =>
                            prev.map((t) => (t.id === payload.new.id ? (payload.new as SupportTicket) : t))
                        );
                        toast({
                            title: 'Ticket Updated',
                            description: 'Your support ticket has been updated',
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        setCreating(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.from('support_tickets').insert({
                client_id: clientId,
                subject,
                description,
                priority,
                status: 'open',
            });

            if (error) throw error;

            toast({
                title: 'Ticket Created',
                description: 'Your support ticket has been submitted successfully',
            });

            // Reset form
            setSubject('');
            setDescription('');
            setPriority('medium');
        } catch (error) {
            console.error('Error creating ticket:', error);
            toast({
                title: 'Error',
                description: 'Failed to create support ticket',
                variant: 'destructive',
            });
        } finally {
            setCreating(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, any> = {
            low: 'secondary',
            medium: 'info',
            high: 'warning',
            urgent: 'destructive',
        };
        return (
            <Badge variant={variants[priority] || 'secondary'}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
        );
    };

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Support Center</h1>
                        <p className="text-muted-foreground">Get help and submit support tickets</p>
                    </div>
                </div>

                <Tabs defaultValue="tickets" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="tickets">Your Tickets</TabsTrigger>
                        <TabsTrigger value="create">Create New Ticket</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tickets">
                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No support tickets yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Create a new ticket if you need assistance with our services.
                                        </p>
                                        <Button onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Ticket
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                tickets.map((ticket) => (
                                    <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => setSelectedTicket(ticket)}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl mb-2">{ticket.subject}</CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {ticket.description}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col gap-2 items-end">
                                                    <StatusBadge status={ticket.status} />
                                                    {getPriorityBadge(ticket.priority)}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Created: {formatDateTime(ticket.created_at)}</span>
                                                <span>Updated: {formatDateTime(ticket.updated_at)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="create">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Support Ticket</CardTitle>
                                <CardDescription>
                                    Fill out the form below to submit a support request
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Brief description of your issue"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            disabled={creating}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority *</Label>
                                        <Select
                                            value={priority}
                                            onValueChange={(value: any) => setPriority(value)}
                                            disabled={creating}
                                        >
                                            <SelectTrigger id="priority">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Detailed description of your issue or request"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                            disabled={creating}
                                            rows={6}
                                        />
                                    </div>

                                    <Button type="submit" disabled={creating}>
                                        {creating ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Ticket Details Dialog */}
                {selectedTicket && (
                    <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                                <DialogDescription>
                                    Ticket ID: {selectedTicket.id}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <StatusBadge status={selectedTicket.status} />
                                    {getPriorityBadge(selectedTicket.priority)}
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Description</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Created</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(selectedTicket.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(selectedTicket.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </div>
    );
}
