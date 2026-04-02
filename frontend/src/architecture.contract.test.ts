/// <reference types="node" />

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	KANBAN_COLUMN_NAMES,
	KANBAN_COLUMN_ORDER,
} from './components/kanban-config';

const SRC_ROOT = dirname(fileURLToPath(import.meta.url));

function walkFiles(directory: string): string[] {
	const entries = readdirSync(directory, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const absolutePath = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkFiles(absolutePath));
			continue;
		}
		if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
			files.push(absolutePath);
		}
	}

	return files;
}

function read(path: string): string {
	return readFileSync(path, 'utf8');
}

describe('frontend architecture contracts', () => {
	it('keeps fetch and axios usage inside the api layer', () => {
		const offenders = walkFiles(SRC_ROOT)
			.filter((path) => !path.includes('/api/'))
			.filter(
				(path) =>
					!path.endsWith('.test.ts') && !path.endsWith('.test.tsx'),
			)
			.filter((path) => {
				const text = read(path);
				return text.includes('fetch(') || text.includes('axios(');
			});

		expect(offenders.map((path) => relative(SRC_ROOT, path))).toEqual([]);
	});

	it('mirrors the backend bug lifecycle in the kanban config', () => {
		expect(KANBAN_COLUMN_ORDER).toEqual([
			'open',
			'in_progress',
			'resolved',
			'closed',
		]);
		expect(KANBAN_COLUMN_NAMES).toEqual({
			open: 'Open',
			in_progress: 'In Progress',
			resolved: 'Resolved',
			closed: 'Closed',
		});
	});
});
