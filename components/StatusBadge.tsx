import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: 'success' | 'failed' | 'running' | 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const variants: Record<string, { variant: any; label: string }> = {
        success: { variant: 'success', label: 'Success' },
        failed: { variant: 'destructive', label: 'Failed' },
        running: { variant: 'warning', label: 'Running' },
        pending: { variant: 'secondary', label: 'Pending' },
        open: { variant: 'info', label: 'Open' },
        in_progress: { variant: 'warning', label: 'In Progress' },
        resolved: { variant: 'success', label: 'Resolved' },
        closed: { variant: 'secondary', label: 'Closed' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
