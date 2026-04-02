import { request } from './client';
import type { CreateUserPayload, User } from './types';

export function listUsers(): Promise<User[]> {
	return request<User[]>('/users');
}

export function createUser(payload: CreateUserPayload): Promise<User> {
	return request<User>('/users', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function blockUser(userId: number): Promise<User> {
	return request<User>(`/users/${userId}/block`, {
		method: 'PATCH',
	});
}

export function unblockUser(userId: number): Promise<User> {
	return request<User>(`/users/${userId}/unblock`, {
		method: 'PATCH',
	});
}
