import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './pages/dashboard-page';

const usersApi = vi.hoisted(() => ({
	listUsers: vi.fn(),
	createUser: vi.fn(),
}));

const projectsApi = vi.hoisted(() => ({
	listProjects: vi.fn(),
	createProject: vi.fn(),
}));

const bugsApi = vi.hoisted(() => ({
	listBugs: vi.fn(),
	createBug: vi.fn(),
	updateBug: vi.fn(),
	transitionBug: vi.fn(),
	listComments: vi.fn(),
	createComment: vi.fn(),
}));

const authContext = vi.hoisted(() => ({
	useAuth: vi.fn(),
}));

vi.mock('./api/users', () => usersApi);
vi.mock('./api/projects', () => projectsApi);
vi.mock('./api/bugs', () => bugsApi);
vi.mock('./lib/auth/use-auth', () => authContext);

describe('Dashboard integration flows', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authContext.useAuth.mockReturnValue({
			user: {
				id: 1,
				name: 'Alice',
				email: 'alice@example.com',
				role: 'admin',
				is_blocked: false,
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z',
			},
			logout: vi.fn(),
		});

		usersApi.listUsers.mockResolvedValue([
			{
				id: 1,
				name: 'Alice',
				email: 'alice@example.com',
				role: 'admin',
				is_blocked: false,
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z',
			},
		]);
		projectsApi.listProjects.mockResolvedValue([
			{
				id: 10,
				name: 'Core',
				description: 'Core project',
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z',
			},
		]);
		bugsApi.listBugs.mockResolvedValue([
			{
				id: 100,
				project_id: 10,
				title: 'Cannot save form',
				description: 'Save button does nothing',
				status: 'open',
				priority: 'high',
				assignee_id: 1,
				resolution_note: null,
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z',
			},
		]);

		usersApi.createUser.mockResolvedValue({
			id: 2,
			name: 'Bob',
			email: 'bob@example.com',
			role: 'member',
			is_blocked: false,
			credential_password: 'password123',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
		projectsApi.createProject.mockResolvedValue({
			id: 11,
			name: 'UI',
			description: 'UI project',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
		bugsApi.createBug.mockResolvedValue({
			id: 101,
			project_id: 10,
			title: 'New regression',
			description: 'Regression detail',
			status: 'open',
			priority: 'medium',
			assignee_id: null,
			resolution_note: null,
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
		bugsApi.updateBug.mockResolvedValue({
			id: 100,
			project_id: 10,
			title: 'Cannot save form',
			description: 'Save button does nothing',
			status: 'open',
			priority: 'high',
			assignee_id: 1,
			resolution_note: null,
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
		bugsApi.transitionBug.mockResolvedValue({
			id: 100,
			project_id: 10,
			title: 'Cannot save form',
			description: 'Save button does nothing',
			status: 'in_progress',
			priority: 'high',
			assignee_id: 1,
			resolution_note: null,
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
		bugsApi.listComments.mockResolvedValue([]);
		bugsApi.createComment.mockResolvedValue({
			id: 500,
			bug_id: 100,
			author_id: 1,
			text: 'Investigating now',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z',
		});
	});

	it('loads board and displays initial bug in open column', async () => {
		render(<DashboardPage />);

		expect(screen.getByText('Loading board...')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('Cannot save form')).toBeInTheDocument();
		});

		expect(
			screen.getByRole('heading', { name: 'Open' }),
		).toBeInTheDocument();
	});

	it('creates user, project, and bug through forms', async () => {
		const user = userEvent.setup();
		render(<DashboardPage />);

		await screen.findAllByText('Cannot save form');

		// Open and submit Create User modal
		const newUserBtn = screen.getAllByRole('button', {
			name: 'New User',
		})[0];
		await user.click(newUserBtn);

		const userNameInput = screen.getByLabelText('Name');
		const userForm = userNameInput.closest('form');
		if (!userForm) {
			throw new Error('User form not found');
		}

		const emailInput = within(userForm).getByPlaceholderText('Email');
		const passwordInput = within(userForm).getByPlaceholderText(
			'At least 8 characters',
		);
		await user.type(userNameInput, 'Bob');
		await user.type(emailInput, 'bob@example.com');
		await user.type(passwordInput, 'password123');
		await user.click(
			within(userForm).getByRole('button', { name: 'Add User' }),
		);

		await waitFor(() => {
			expect(usersApi.createUser).toHaveBeenCalledWith({
				name: 'Bob',
				email: 'bob@example.com',
				password: 'password123',
			});
		});

		// Open and submit Create Project modal
		const newProjectBtn = screen.getAllByRole('button', {
			name: 'New Project',
		})[0];
		await user.click(newProjectBtn);

		const projectName = screen.getByLabelText('Project Name');
		const projectForm = projectName.closest('form');
		if (!projectForm) {
			throw new Error('Project form not found');
		}
		const projectDesc =
			within(projectForm).getByPlaceholderText('Description');
		await user.type(projectName, 'UI');
		await user.type(projectDesc, 'UI project');
		await user.click(
			within(projectForm).getByRole('button', { name: 'Add Project' }),
		);

		await waitFor(() => {
			expect(projectsApi.createProject).toHaveBeenCalledWith({
				name: 'UI',
				description: 'UI project',
			});
		});

		// Open and submit Create Bug modal
		const newBugBtn = screen.getAllByRole('button', {
			name: 'New Bug',
		})[0];
		await user.click(newBugBtn);

		const bugTitle = screen.getByLabelText('Title');
		const bugForm = bugTitle.closest('form');
		if (!bugForm) {
			throw new Error('Bug form not found');
		}

		await user.type(bugTitle, 'New regression');
		await user.type(
			within(bugForm).getByPlaceholderText('Description'),
			'Regression detail',
		);
		await user.click(within(bugForm).getAllByRole('combobox')[0]);
		await user.click(await screen.findByRole('option', { name: 'Core' }));
		await user.click(
			within(bugForm).getByRole('button', { name: 'Add Bug' }),
		);

		await waitFor(() => {
			expect(bugsApi.createBug).toHaveBeenCalledWith({
				title: 'New regression',
				description: 'Regression detail',
				project_id: 10,
				priority: 'medium',
			});
		});
	});

	it('shows transition error when backend rejects action', async () => {
		bugsApi.transitionBug.mockRejectedValueOnce(
			new Error('Assignee required before transitioning to in_progress'),
		);
		const user = userEvent.setup();
		render(<DashboardPage />);

		await screen.findAllByText('Cannot save form');

		const card = screen
			.getAllByRole('button', {
				name: 'Bug #100 High Cannot save form',
			})[0]
			.closest('article');
		if (!card) {
			throw new Error('expected bug card');
		}
		await user.click(
			within(card).getByRole('button', { name: 'Expand bug details' }),
		);
		await user.click(
			within(card).getByRole('button', { name: 'Move to In Progress' }),
		);

		await waitFor(() => {
			expect(
				screen.getByText(
					'Assignee required before transitioning to in_progress',
				),
			).toBeInTheDocument();
		});
	});
});
