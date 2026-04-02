import type { Bug, BugStatus } from '../api/types';

export const KANBAN_COLUMN_ORDER: BugStatus[] = [
	'open',
	'in_progress',
	'resolved',
	'closed',
];

export const KANBAN_COLUMN_NAMES: Record<BugStatus, string> = {
	open: 'Open',
	in_progress: 'In Progress',
	resolved: 'Resolved',
	closed: 'Closed',
};

export function bugsToKanbanColumns(bugs: Bug[]) {
	return {
		open: bugs.filter((bug) => bug.status === 'open'),
		in_progress: bugs.filter((bug) => bug.status === 'in_progress'),
		resolved: bugs.filter((bug) => bug.status === 'resolved'),
		closed: bugs.filter((bug) => bug.status === 'closed'),
	};
}
