import { describe, expect, it } from 'vitest';
import type { Bug } from '../api/types';
import {
	bugsToKanbanColumns,
	KANBAN_COLUMN_NAMES,
	KANBAN_COLUMN_ORDER,
} from './kanban-config';

const bugs: Bug[] = [
	{
		id: 1,
		project_id: 1,
		title: 'Open bug',
		description: 'desc',
		status: 'open',
		priority: 'low',
		assignee_id: null,
		resolution_note: null,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
	},
	{
		id: 2,
		project_id: 1,
		title: 'Working bug',
		description: 'desc',
		status: 'in_progress',
		priority: 'medium',
		assignee_id: 1,
		resolution_note: null,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
	},
	{
		id: 3,
		project_id: 1,
		title: 'Resolved bug',
		description: 'desc',
		status: 'resolved',
		priority: 'high',
		assignee_id: 1,
		resolution_note: 'done',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
	},
	{
		id: 4,
		project_id: 1,
		title: 'Closed bug',
		description: 'desc',
		status: 'closed',
		priority: 'critical',
		assignee_id: 1,
		resolution_note: 'done',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
	},
];

describe('kanban config', () => {
	it('keeps the expected column order and labels', () => {
		expect(KANBAN_COLUMN_ORDER).toEqual([
			'open',
			'in_progress',
			'resolved',
			'closed',
		]);
		expect(KANBAN_COLUMN_NAMES.open).toBe('Open');
		expect(KANBAN_COLUMN_NAMES.in_progress).toBe('In Progress');
		expect(KANBAN_COLUMN_NAMES.resolved).toBe('Resolved');
		expect(KANBAN_COLUMN_NAMES.closed).toBe('Closed');
	});

	it('partitions bugs into the four workflow columns', () => {
		const columns = bugsToKanbanColumns([...bugs]);

		expect(columns.open).toHaveLength(1);
		expect(columns.in_progress).toHaveLength(1);
		expect(columns.resolved).toHaveLength(1);
		expect(columns.closed).toHaveLength(1);
		expect(columns.open[0].id).toBe(1);
		expect(columns.in_progress[0].id).toBe(2);
		expect(columns.resolved[0].id).toBe(3);
		expect(columns.closed[0].id).toBe(4);
	});
});
