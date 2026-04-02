import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
	it('renders in progress label for in_progress status', () => {
		render(<StatusBadge status='in_progress' />);

		expect(screen.getByText('In Progress')).toBeInTheDocument();
	});

	it('renders closed label for closed status', () => {
		render(<StatusBadge status='closed' />);

		expect(screen.getByText('Closed')).toBeInTheDocument();
	});
});
