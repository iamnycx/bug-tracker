import { createContext } from 'react';
import type { LoginPayload, User } from '../../api/types';

export type AuthContextValue = {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
