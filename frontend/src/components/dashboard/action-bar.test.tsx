import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardActionBar } from './action-bar';

describe('DashboardActionBar', () => {
	it('shows the product title and right-aligned actions', () => {
		render(
			<DashboardActionBar
				disabled={false}
				disableNewBug={false}
				isAdmin={true}
				onNewUser={vi.fn()}
				onNewProject={vi.fn()}
				onNewBug={vi.fn()}
				onViewUsersProjects={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole('heading', { name: 'Bug Tracker' }),
		).toBeInTheDocument();
		expect(
			screen.getAllByTitle('View all users and projects').length,
		).toBeGreaterThan(0);
		expect(screen.getByText('New User')).toBeInTheDocument();
		expect(screen.getByText('New Project')).toBeInTheDocument();
		expect(screen.getByText('New Bug')).toBeInTheDocument();
	});

	it('hides admin-only creation actions for members', () => {
		render(
			<DashboardActionBar
				disabled={false}
				disableNewBug={false}
				isAdmin={false}
				onNewUser={vi.fn()}
				onNewProject={vi.fn()}
				onNewBug={vi.fn()}
				onViewUsersProjects={vi.fn()}
			/>,
		);

		expect(
			screen.getAllByTitle('View all users and projects').length,
		).toBeGreaterThan(0);
		expect(screen.queryByText('New User')).not.toBeInTheDocument();
		expect(screen.queryByText('New Project')).not.toBeInTheDocument();
		expect(screen.queryByText('New Bug')).not.toBeInTheDocument();
	});
});
