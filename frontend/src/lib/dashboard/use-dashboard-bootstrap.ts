import { useEffect } from 'react';
import { listBugs } from '../../api/bugs';
import { listProjects } from '../../api/projects';
import type { Bug, Project, User } from '../../api/types';
import { listUsers } from '../../api/users';

type BootstrapParams = {
	setLoading: (value: boolean) => void;
	setError: (value: string | null) => void;
	setUsers: (updater: (prev: User[]) => User[]) => void;
	setProjects: (updater: (prev: Project[]) => Project[]) => void;
	setBugs: (updater: (prev: Bug[]) => Bug[]) => void;
};

export function useDashboardBootstrap({
	setLoading,
	setError,
	setUsers,
	setProjects,
	setBugs,
}: BootstrapParams) {
	useEffect(() => {
		let cancelled = false;

		async function bootstrap() {
			setLoading(true);
			setError(null);
			try {
				const [loadedUsers, loadedProjects, loadedBugs] =
					await Promise.all([
						listUsers(),
						listProjects(),
						listBugs(),
					]);
				if (cancelled) return;
				setUsers(() => loadedUsers);
				setProjects(() => loadedProjects);
				setBugs(() => loadedBugs);
			} catch (requestError) {
				if (!cancelled) {
					setError(
						requestError instanceof Error
							? requestError.message
							: 'Failed to load data',
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void bootstrap();
		return () => {
			cancelled = true;
		};
	}, [setBugs, setError, setLoading, setProjects, setUsers]);
}
