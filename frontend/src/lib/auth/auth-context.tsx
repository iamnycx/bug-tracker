import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, login as loginRequest } from '../../api/auth';
import type { LoginPayload, User } from '../../api/types';
import { AuthContext, type AuthContextValue } from './auth-context-store';
import { clearAuthToken, getAuthToken, setAuthToken } from './token';

export function AuthProvider({ children }: { children: ReactNode }) {
	const initialToken = getAuthToken();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(Boolean(initialToken));

	useEffect(() => {
		let mounted = true;
		if (!initialToken) {
			return;
		}

		void getMe()
			.then((currentUser) => {
				if (!mounted) return;
				setUser(currentUser);
			})
			.catch(() => {
				if (!mounted) return;
				clearAuthToken();
				setUser(null);
			})
			.finally(() => {
				if (!mounted) return;
				setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [initialToken]);

	async function login(payload: LoginPayload) {
		const result = await loginRequest(payload);
		setAuthToken(result.access_token);
		setUser(result.user);
	}

	function logout() {
		clearAuthToken();
		setUser(null);
	}

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			loading,
			isAuthenticated: !!user,
			login,
			logout,
		}),
		[user, loading],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
