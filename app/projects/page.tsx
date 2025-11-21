'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { Project } from '@/types/database';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
    const { clientId, isLoading: clientLoading } = useClient();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchProjects();
        }
    }, [clientId, clientLoading]);

    const fetchProjects = async () => {
        if (!clientId) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
                <p className="text-muted-foreground mb-8">View and manage your automation projects</p>

                {projects.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Projects will appear here once you start working with our automation services.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Contact support to get started with a new project!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <CardTitle className="text-xl">{project.name}</CardTitle>
                                        <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {project.description || 'No description available'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created</span>
                                            <span className="font-medium">{formatDate(project.created_at)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
