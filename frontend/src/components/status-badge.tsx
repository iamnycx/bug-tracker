import { cn } from '../lib/utils';
import type { BugStatus } from '../api/types';

const STATUS_LABEL: Record<BugStatus, string> = {
	open: 'Open',
	in_progress: 'In Progress',
	resolved: 'Resolved',
	closed: 'Closed',
};

const STATUS_STYLE: Record<BugStatus, string> = {
	open: 'bg-sky-100 text-sky-800 border-sky-300',
	in_progress: 'bg-amber-100 text-amber-900 border-amber-300',
	resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
	closed: 'bg-zinc-200 text-zinc-800 border-zinc-400',
};

type StatusBadgeProps = {
	status: BugStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-none border border-dashed px-2 py-1 text-xs font-semibold tracking-wide',
				STATUS_STYLE[status],
			)}
		>
			{STATUS_LABEL[status]}
		</span>
	);
}
