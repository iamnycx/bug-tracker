import { useDashboardBootstrap } from './use-dashboard-bootstrap';
import { useDashboardBugActions } from './use-dashboard-bug-actions';
import { useDashboardCreateActions } from './use-dashboard-create-actions';
import { useDashboardState } from './use-dashboard-state';

export function useDashboardData() {
	const state = useDashboardState();

	useDashboardBootstrap({
		setLoading: state.setLoading,
		setError: state.setError,
		setUsers: state.setUsers,
		setProjects: state.setProjects,
		setBugs: state.setBugs,
	});

	const createActions = useDashboardCreateActions({
		setSubmitting: state.setSubmitting,
		setError: state.setError,
		setUsers: state.setUsers,
		setProjects: state.setProjects,
		setBugs: state.setBugs,
	});

	const bugActions = useDashboardBugActions({
		setBugs: state.setBugs,
		setCommentsByBug: state.setCommentsByBug,
		setLoadingCommentsByBug: state.setLoadingCommentsByBug,
		setActionErrorByBug: state.setActionErrorByBug,
	});

	return {
		users: state.users,
		projects: state.projects,
		bugs: state.bugs,
		commentsByBug: state.commentsByBug,
		loadingCommentsByBug: state.loadingCommentsByBug,
		loading: state.loading,
		submitting: state.submitting,
		error: state.error,
		actionErrorByBug: state.actionErrorByBug,
		...createActions,
		...bugActions,
	};
}
