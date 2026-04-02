import { describe, expect, it, vi } from 'vitest';
import { request } from './client';
import type { ApiResponse } from './types';

const authToken = vi.hoisted(() => ({
	getAuthToken: vi.fn(),
}));

vi.mock('../lib/auth/token', () => authToken);

/**
 * Contract: backend must return { data, error, status } for every JSON response.
 * Keeps frontend request() and error handling aligned with backend rules.
 */
describe('API response contract', () => {
	it('ApiResponse shape matches backend envelope', () => {
		const success: ApiResponse<{ id: number }> = {
			data: { id: 1 },
			error: null,
			status: 200,
		};
		expect(success).toMatchObject({
			data: expect.any(Object),
			error: null,
			status: expect.any(Number),
		});

		const failure: ApiResponse<null> = {
			data: null,
			error: 'bad',
			status: 400,
		};
		expect(failure).toMatchObject({
			data: null,
			error: expect.any(String),
			status: expect.any(Number),
		});
	});

	it('request forwards bearer tokens and returns data payloads', async () => {
		authToken.getAuthToken.mockReturnValue('token-123');
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: { ok: true },
					error: null,
					status: 200,
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			),
		);
		vi.stubGlobal('fetch', fetchMock);

		await expect(request<{ ok: boolean }>('/bugs')).resolves.toEqual({
			ok: true,
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(String(url)).toContain('/bugs');
		expect(init).toMatchObject({
			headers: {
				Authorization: 'Bearer token-123',
				'Content-Type': 'application/json',
			},
		});
	});

	it('request surfaces backend error messages', async () => {
		authToken.getAuthToken.mockReturnValue(null);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						data: null,
						error: 'not allowed',
						status: 400,
					}),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					},
				),
			),
		);

		await expect(request('/bugs')).rejects.toThrow('not allowed');
	});
});
