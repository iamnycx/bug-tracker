import { useCallback } from 'react';
import { toast } from 'sonner';
import { createBug } from '../../api/bugs';
import { createProject } from '../../api/projects';
import type {
	Bug,
	CreateBugPayload,
	CreateProjectPayload,
	CreateUserPayload,
	Project,
	User,
} from '../../api/types';
import { blockUser, createUser, unblockUser } from '../../api/users';

type CreateActionParams = {
	setSubmitting: (value: boolean) => void;
	setError: (value: string | null) => void;
	setUsers: (updater: (prev: User[]) => User[]) => void;
	setProjects: (updater: (prev: Project[]) => Project[]) => void;
	setBugs: (updater: (prev: Bug[]) => Bug[]) => void;
};

export function useDashboardCreateActions({
	setSubmitting,
	setError,
	setUsers,
	setProjects,
	setBugs,
}: CreateActionParams) {
	const handleCreateUser = useCallback(
		async (payload: CreateUserPayload) => {
			setSubmitting(true);
			setError(null);
			try {
				const created = await createUser(payload);
				setUsers((prev) => [...prev, created]);
			} catch (requestError) {
				toast.error(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create user',
				);
				setError(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create user',
				);
			} finally {
				setSubmitting(false);
			}
		},
		[setError, setSubmitting, setUsers],
	);

	const handleCreateProject = useCallback(
		async (payload: CreateProjectPayload) => {
			setSubmitting(true);
			setError(null);
			try {
				const created = await createProject(payload);
				setProjects((prev) => [...prev, created]);
			} catch (requestError) {
				toast.error(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create project',
				);
				setError(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create project',
				);
			} finally {
				setSubmitting(false);
			}
		},
		[setError, setProjects, setSubmitting],
	);

	const handleCreateBug = useCallback(
		async (payload: CreateBugPayload) => {
			setSubmitting(true);
			setError(null);
			try {
				const created = await createBug(payload);
				setBugs((prev) => [created, ...prev]);
			} catch (requestError) {
				toast.error(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create bug',
				);
				setError(
					requestError instanceof Error
						? requestError.message
						: 'Failed to create bug',
				);
			} finally {
				setSubmitting(false);
			}
		},
		[setBugs, setError, setSubmitting],
	);

	const handleBlockUser = useCallback(
		async (userId: number) => {
			setSubmitting(true);
			setError(null);
			try {
				const updated = await blockUser(userId);
				setUsers((prev) =>
					prev.map((user) =>
						user.id === updated.id ? updated : user,
					),
				);
			} catch (requestError) {
				toast.error(
					requestError instanceof Error
						? requestError.message
						: 'Failed to block user',
				);
				setError(
					requestError instanceof Error
						? requestError.message
						: 'Failed to block user',
				);
			} finally {
				setSubmitting(false);
			}
		},
		[setError, setSubmitting, setUsers],
	);

	const handleUnblockUser = useCallback(
		async (userId: number) => {
			setSubmitting(true);
			setError(null);
			try {
				const updated = await unblockUser(userId);
				setUsers((prev) =>
					prev.map((user) =>
						user.id === updated.id ? updated : user,
					),
				);
			} catch (requestError) {
				toast.error(
					requestError instanceof Error
						? requestError.message
						: 'Failed to unblock user',
				);
				setError(
					requestError instanceof Error
						? requestError.message
						: 'Failed to unblock user',
				);
			} finally {
				setSubmitting(false);
			}
		},
		[setError, setSubmitting, setUsers],
	);

	return {
		handleCreateUser,
		handleCreateProject,
		handleCreateBug,
		handleBlockUser,
		handleUnblockUser,
	};
}
