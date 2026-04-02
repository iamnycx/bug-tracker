import { request } from './client';
import type { AuthResult, LoginPayload, User } from './types';

export function login(payload: LoginPayload): Promise<AuthResult> {
	return request<AuthResult>('/auth/login', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function getMe(): Promise<User> {
	return request<User>('/auth/me');
}
