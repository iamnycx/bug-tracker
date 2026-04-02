import type {
	Bug,
	Comment,
	UpdateBugPayload,
	User,
	BugStatus,
} from '../../api/types';
import { motion, useReducedMotion } from 'motion/react';
import { fadeSlideIn } from '../animations';
import { KanbanBoard } from '../kanban-board';
import { Card } from '../ui/card';

type BoardViewProps = {
	loading: boolean;
	bugs: Bug[];
	users: User[];
	currentUser: User;
	commentsByBug: Record<number, Comment[]>;
	loadingCommentsByBug: Record<number, boolean>;
	actionErrorByBug: Record<number, string>;
	onTransition: (bugId: number, status: BugStatus) => Promise<void>;
	onSaveMeta: (bugId: number, payload: UpdateBugPayload) => Promise<void>;
	onLoadComments: (bugId: number) => Promise<void>;
	onAddComment: (bugId: number, payload: { text: string }) => Promise<void>;
};

export function DashboardBoardView(props: BoardViewProps) {
	const shouldReduceMotion = useReducedMotion();

	if (props.loading) {
		return (
			<motion.div
				initial={shouldReduceMotion ? false : 'hidden'}
				animate={shouldReduceMotion ? undefined : 'visible'}
				variants={shouldReduceMotion ? undefined : fadeSlideIn}
			>
				<Card className='h-full px-3 py-2 text-sm text-muted-foreground'>
					Loading board...
				</Card>
			</motion.div>
		);
	}

	return (
		<div className='flex h-full min-h-0 flex-col'>
			<div className='min-h-0 flex-1'>
				<KanbanBoard
					bugs={props.bugs}
					users={props.users}
					currentUser={props.currentUser}
					commentsByBug={props.commentsByBug}
					loadingCommentsByBug={props.loadingCommentsByBug}
					actionErrorByBug={props.actionErrorByBug}
					handleTransition={props.onTransition}
					handleSaveMeta={props.onSaveMeta}
					handleLoadComments={props.onLoadComments}
					handleAddComment={props.onAddComment}
				/>
			</div>
		</div>
	);
}
