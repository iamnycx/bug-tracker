import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
	it('renders an accessible dialog and focuses the first field', async () => {
		render(
			<Modal isOpen title='Create New Bug' onClose={vi.fn()}>
				<label htmlFor='name-field'>Name</label>
				<input id='name-field' />
			</Modal>,
		);

		expect(
			screen.getByRole('dialog', { name: 'Create New Bug' }),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByLabelText('Name')).toHaveFocus();
		});
	});

	it('closes when escape is pressed', async () => {
		const onClose = vi.fn();
		render(
			<Modal isOpen title='Create New Project' onClose={onClose}>
				<input aria-label='Project Name' />
			</Modal>,
		);

		await userEvent.keyboard('{Escape}');
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
