import { useCallback } from 'react';
import { toast } from 'sonner';
import {
	createComment,
	listComments,
	transitionBug,
	updateBug,
} from '../../api/bugs';
import type { Bug, BugStatus, UpdateBugPayload } from '../../api/types';
import type { ActionErrorMap, CommentsMap, LoadingMap } from './types';

function upsertBug(bugs: Bug[], updated: Bug): Bug[] {
	return bugs.map((bug) => (bug.id === updated.id ? updated : bug));
}

type BugActionParams = {
	setBugs: (updater: (prev: Bug[]) => Bug[]) => void;
	setCommentsByBug: (updater: (prev: CommentsMap) => CommentsMap) => void;
	setLoadingCommentsByBug: (
		updater: (prev: LoadingMap) => LoadingMap,
	) => void;
	setActionErrorByBug: (
		updater: (prev: ActionErrorMap) => ActionErrorMap,
	) => void;
};

export function useDashboardBugActions({
	setBugs,
	setCommentsByBug,
	setLoadingCommentsByBug,
	setActionErrorByBug,
}: BugActionParams) {
	const handleSaveMeta = useCallback(
		async (bugId: number, payload: UpdateBugPayload) => {
			setActionErrorByBug((prev) => ({ ...prev, [bugId]: '' }));
			try {
				const updated = await updateBug(bugId, payload);
				setBugs((prev) => upsertBug(prev, updated));
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Failed to update bug',
				);
				setActionErrorByBug((prev) => ({
					...prev,
					[bugId]:
						error instanceof Error
							? error.message
							: 'Failed to update bug',
				}));
			}
		},
		[setActionErrorByBug, setBugs],
	);

	const handleTransition = useCallback(
		async (bugId: number, next: BugStatus) => {
			setActionErrorByBug((prev) => ({ ...prev, [bugId]: '' }));
			try {
				const updated = await transitionBug(bugId, next);
				setBugs((prev) => upsertBug(prev, updated));
				const successByStatus: Partial<Record<BugStatus, string>> = {
					in_progress: 'Moved to In Progress',
					resolved: 'Moved to Resolved',
					closed: 'Bug closed',
				};
				const msg = successByStatus[next];
				if (msg) {
					toast.success(msg);
				}
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Transition failed',
				);
				setActionErrorByBug((prev) => ({
					...prev,
					[bugId]:
						error instanceof Error
							? error.message
							: 'Transition failed',
				}));
			}
		},
		[setActionErrorByBug, setBugs],
	);

	const handleLoadComments = useCallback(
		async (bugId: number) => {
			setLoadingCommentsByBug((prev) => ({ ...prev, [bugId]: true }));
			setActionErrorByBug((prev) => ({ ...prev, [bugId]: '' }));
			try {
				const comments = await listComments(bugId);
				setCommentsByBug((prev) => ({ ...prev, [bugId]: comments }));
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Failed to load comments',
				);
				setActionErrorByBug((prev) => ({
					...prev,
					[bugId]:
						error instanceof Error
							? error.message
							: 'Failed to load comments',
				}));
			} finally {
				setLoadingCommentsByBug((prev) => ({
					...prev,
					[bugId]: false,
				}));
			}
		},
		[setActionErrorByBug, setCommentsByBug, setLoadingCommentsByBug],
	);

	const handleAddComment = useCallback(
		async (bugId: number, payload: { text: string }) => {
			setActionErrorByBug((prev) => ({ ...prev, [bugId]: '' }));
			try {
				await createComment(bugId, payload);
				const refreshed = await listComments(bugId);
				setCommentsByBug((prev) => ({ ...prev, [bugId]: refreshed }));
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Failed to add comment',
				);
				setActionErrorByBug((prev) => ({
					...prev,
					[bugId]:
						error instanceof Error
							? error.message
							: 'Failed to add comment',
				}));
			}
		},
		[setActionErrorByBug, setCommentsByBug],
	);

	return {
		handleSaveMeta,
		handleTransition,
		handleLoadComments,
		handleAddComment,
	};
}
