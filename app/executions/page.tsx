'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { WorkflowExecution } from '@/types/database';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Download, Search } from 'lucide-react';
import { formatCurrency, formatDateTime, formatDuration, formatTokens, exportToCSV } from '@/lib/utils';

export default function ExecutionsPage() {
    const { clientId, isLoading: clientLoading } = useClient();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [filteredExecutions, setFilteredExecutions] = useState<WorkflowExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const itemsPerPage = 25;

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchExecutions();
            subscribeToExecutions();
        }
    }, [clientId, clientLoading]);

    useEffect(() => {
        filterExecutions();
    }, [executions, searchQuery, statusFilter, providerFilter]);

    const fetchExecutions = async () => {
        if (!clientId) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('workflow_executions')
                .select('*')
                .eq('client_id', clientId)
                .order('start_time', { ascending: false });

            if (error) throw error;
            setExecutions(data || []);
        } catch (error) {
            console.error('Error fetching executions:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch executions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const subscribeToExecutions = () => {
        if (!clientId) return;

        const supabase = createClient();
        const channel = supabase
            .channel('executions_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'workflow_executions',
                    filter: `client_id=eq.${clientId}`,
                },
                (payload) => {
                    const newExecution = payload.new as WorkflowExecution;
                    setExecutions((prev) => [newExecution, ...prev]);
                    toast({
                        title: 'New Execution',
                        description: `${newExecution.workflow_name} completed`,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const filterExecutions = () => {
        let filtered = executions;

        if (searchQuery) {
            filtered = filtered.filter(
                (e) =>
                    e.workflow_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((e) => e.status === statusFilter);
        }

        if (providerFilter !== 'all') {
            filtered = filtered.filter((e) => e.ai_provider === providerFilter);
        }

        setFilteredExecutions(filtered);
        setCurrentPage(1);
    };

    const handleExport = () => {
        const exportData = filteredExecutions.map((e) => ({
            'Workflow Name': e.workflow_name,
            'Status': e.status,
            'AI Provider': e.ai_provider,
            'Model': e.model_used,
            'Cost': e.cost,
            'Input Tokens': e.input_tokens,
            'Output Tokens': e.output_tokens,
            'Duration': formatDuration(e.start_time, e.end_time),
            'Timestamp': formatDateTime(e.start_time),
        }));
        exportToCSV(exportData, `executions_${new Date().toISOString().split('T')[0]}`);
        toast({
            title: 'Export Successful',
            description: `Exported ${exportData.length} executions to CSV`,
        });
    };

    const providers = Array.from(new Set(executions.map((e) => e.ai_provider)));

    const paginatedExecutions = filteredExecutions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredExecutions.length / itemsPerPage);

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <Skeleton className="h-96" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Your Workflow History</h1>
                        <p className="text-muted-foreground">View and filter all your workflow executions</p>
                    </div>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by workflow name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="running">Running</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={providerFilter} onValueChange={setProviderFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Providers</SelectItem>
                                    {providers.map((provider) => (
                                        <SelectItem key={provider} value={provider}>
                                            {provider}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Executions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Executions ({filteredExecutions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredExecutions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No executions found</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Workflow Name</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Cost</TableHead>
                                                <TableHead>Tokens (In/Out)</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedExecutions.map((execution) => (
                                                <TableRow key={execution.id}>
                                                    <TableCell className="font-medium">{execution.workflow_name}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={execution.status} />
                                                    </TableCell>
                                                    <TableCell>{execution.ai_provider}</TableCell>
                                                    <TableCell>{execution.model_used}</TableCell>
                                                    <TableCell>{formatCurrency(execution.cost)}</TableCell>
                                                    <TableCell>
                                                        {formatTokens(execution.input_tokens)} / {formatTokens(execution.output_tokens)}
                                                    </TableCell>
                                                    <TableCell>{formatDuration(execution.start_time, execution.end_time)}</TableCell>
                                                    <TableCell>{formatDateTime(execution.start_time)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedExecution(execution)}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                            {Math.min(currentPage * itemsPerPage, filteredExecutions.length)} of{' '}
                                            {filteredExecutions.length} results
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Execution Details Dialog */}
                {selectedExecution && (
                    <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Execution Details</DialogTitle>
                                <DialogDescription>Full details for this workflow execution</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Workflow Name</p>
                                        <p className="text-sm text-muted-foreground">{selectedExecution.workflow_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <StatusBadge status={selectedExecution.status} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">AI Provider</p>
                                        <p className="text-sm text-muted-foreground">{selectedExecution.ai_provider}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Model</p>
                                        <p className="text-sm text-muted-foreground">{selectedExecution.model_used}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Cost</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(selectedExecution.cost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Duration</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDuration(selectedExecution.start_time, selectedExecution.end_time)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Input Tokens</p>
                                        <p className="text-sm text-muted-foreground">{selectedExecution.input_tokens.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Output Tokens</p>
                                        <p className="text-sm text-muted-foreground">{selectedExecution.output_tokens.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Start Time</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTime(selectedExecution.start_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">End Time</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedExecution.end_time ? formatDateTime(selectedExecution.end_time) : 'In Progress'}
                                        </p>
                                    </div>
                                </div>
                                {selectedExecution.execution_metadata && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Metadata</p>
                                        <pre className="text-xs bg-slate-100 p-3 rounded-md overflow-auto max-h-40">
                                            {JSON.stringify(selectedExecution.execution_metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </div>
    );
}
