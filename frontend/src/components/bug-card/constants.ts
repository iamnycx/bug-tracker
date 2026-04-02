import type { BugPriority, BugStatus } from '../../api/types';

export const NEXT_STATUS: Record<BugStatus, BugStatus | null> = {
	open: 'in_progress',
	in_progress: 'resolved',
	resolved: 'closed',
	closed: null,
};

export function nextStatusLabel(status: BugStatus | null): string {
	if (!status) return 'Completed';
	if (status === 'in_progress') return 'Move to In Progress';
	if (status === 'resolved') return 'Move to Resolved';
	if (status === 'closed') return 'Move to Closed';
	return 'Move';
}

export const PRIORITY_INDICATORS: Record<
	'low' | 'medium' | 'high' | 'critical',
	string
> = {
	low: 'bg-sky-400',
	medium: 'bg-emerald-400',
	high: 'bg-amber-400',
	critical: 'bg-rose-400',
};

export function formatPriorityLabel(priority: BugPriority): string {
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}
