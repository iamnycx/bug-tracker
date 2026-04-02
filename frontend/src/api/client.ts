import type { ApiResponse } from './types';
import { getAuthToken } from '../lib/auth/token';

const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl
	? configuredApiBaseUrl.replace(/\/+$/, '')
	: '';

async function parseError(response: Response): Promise<string> {
	try {
		const payload = (await response.json()) as ApiResponse<unknown>;
		return payload.error ?? `Request failed with status ${response.status}`;
	} catch {
		return `Request failed with status ${response.status}`;
	}
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getAuthToken();
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(init?.headers ?? {}),
		},
		...init,
	});

	if (!response.ok) {
		throw new Error(await parseError(response));
	}

	const payload = (await response.json()) as ApiResponse<T>;
	if (payload.error) {
		throw new Error(payload.error);
	}

	return payload.data;
}
