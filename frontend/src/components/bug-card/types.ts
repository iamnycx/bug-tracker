import type {
	Bug,
	BugStatus,
	Comment,
	UpdateBugPayload,
	User,
} from '../../api/types';

export type BugCardActions = {
	handleSaveMeta: (bugId: number, payload: UpdateBugPayload) => Promise<void>;
	handleTransition: (bugId: number, status: BugStatus) => Promise<void>;
	handleLoadComments: (bugId: number) => Promise<void>;
	handleAddComment: (
		bugId: number,
		payload: { text: string },
	) => Promise<void>;
};

export type BugCardProps = {
	bug: Bug;
	users: User[];
	currentUser: User;
	comments: Comment[];
	commentsLoading: boolean;
	actionError?: string;
} & BugCardActions;
