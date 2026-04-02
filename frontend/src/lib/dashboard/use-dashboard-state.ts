import { useState } from 'react';
import type { Bug, Project, User } from '../../api/types';
import type { ActionErrorMap, CommentsMap, LoadingMap } from './types';

export function useDashboardState() {
	const [users, setUsers] = useState<User[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [bugs, setBugs] = useState<Bug[]>([]);
	const [commentsByBug, setCommentsByBug] = useState<CommentsMap>({});
	const [loadingCommentsByBug, setLoadingCommentsByBug] =
		useState<LoadingMap>({});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [actionErrorByBug, setActionErrorByBug] = useState<ActionErrorMap>(
		{},
	);

	return {
		users,
		setUsers,
		projects,
		setProjects,
		bugs,
		setBugs,
		commentsByBug,
		setCommentsByBug,
		loadingCommentsByBug,
		setLoadingCommentsByBug,
		loading,
		setLoading,
		submitting,
		setSubmitting,
		error,
		setError,
		actionErrorByBug,
		setActionErrorByBug,
	};
}
