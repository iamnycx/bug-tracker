import { request } from './client';
import type {
	Bug,
	BugStatus,
	Comment,
	CreateBugPayload,
	CreateCommentPayload,
	TransitionBugPayload,
	UpdateBugPayload,
} from './types';

export function listBugs(): Promise<Bug[]> {
	return request<Bug[]>('/bugs');
}

export function createBug(payload: CreateBugPayload): Promise<Bug> {
	return request<Bug>('/bugs', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function updateBug(
	bugId: number,
	payload: UpdateBugPayload,
): Promise<Bug> {
	return request<Bug>(`/bugs/${bugId}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
}

export function transitionBug(bugId: number, status: BugStatus): Promise<Bug> {
	const payload: TransitionBugPayload = { status };
	return request<Bug>(`/bugs/${bugId}/transition`, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function listComments(bugId: number): Promise<Comment[]> {
	return request<Comment[]>(`/bugs/${bugId}/comments`);
}

export function createComment(
	bugId: number,
	payload: CreateCommentPayload,
): Promise<Comment> {
	return request<Comment>(`/bugs/${bugId}/comments`, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
