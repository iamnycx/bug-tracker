export type ApiResponse<T> = {
	data: T;
	error: string | null;
	status: number;
};

export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type BugPriority = 'low' | 'medium' | 'high' | 'critical';

export type User = {
	id: number;
	name: string;
	email: string;
	role: 'admin' | 'member';
	is_blocked: boolean;
	credential_password?: string | null;
	created_at: string;
	updated_at: string;
};

export type Project = {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
};

export type Comment = {
	id: number;
	bug_id: number;
	author_id: number;
	text: string;
	created_at: string;
	updated_at: string;
};

export type Bug = {
	id: number;
	project_id: number;
	title: string;
	description: string;
	status: BugStatus;
	priority: BugPriority;
	assignee_id: number | null;
	resolution_note: string | null;
	created_at: string;
	updated_at: string;
};

export type CreateUserPayload = {
	name: string;
	email: string;
	password: string;
	role?: 'admin' | 'member';
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type AuthResult = {
	access_token: string;
	token_type: string;
	user: User;
};

export type CreateProjectPayload = {
	name: string;
	description?: string;
};

export type CreateBugPayload = {
	title: string;
	description: string;
	project_id: number;
	priority: BugPriority;
};

export type UpdateBugPayload = {
	title?: string;
	description?: string;
	priority?: BugPriority;
	assignee_id?: number | null;
	resolution_note?: string | null;
};

export type TransitionBugPayload = {
	status: BugStatus;
};

export type CreateCommentPayload = {
	text: string;
};
