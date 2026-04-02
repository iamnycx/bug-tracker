import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/use-auth';

export function ProtectedRoute({ children }: { children: ReactElement }) {
	const { loading, isAuthenticated } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className='h-screen overflow-hidden bg-background text-foreground'>
				<div className='mx-auto flex h-full w-full max-w-md items-center justify-center px-6'>
					<p className='text-sm text-muted-foreground'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<Navigate to='/login' replace state={{ from: location.pathname }} />
		);
	}

	return children;
}
