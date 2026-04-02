import { request } from './client';
import type { CreateProjectPayload, Project } from './types';

export function listProjects(): Promise<Project[]> {
	return request<Project[]>('/projects');
}

export function createProject(payload: CreateProjectPayload): Promise<Project> {
	return request<Project>('/projects', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}
