import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type {
	Bug,
	BugStatus,
	Comment,
	UpdateBugPayload,
	User,
} from '../api/types';
import { springSoft } from './animations';
import { BugCard } from './bug-card';

interface BoardColumnProps {
	id: BugStatus;
	title: string;
	count: number;
	bugs: Bug[];
	users: User[];
	currentUser: User;
	commentsByBug: Record<number, Comment[]>;
	loadingCommentsByBug: Record<number, boolean>;
	actionErrorByBug: Record<number, string>;
	handleSaveMeta: (bugId: number, payload: UpdateBugPayload) => Promise<void>;
	handleTransition: (bugId: number, status: BugStatus) => Promise<void>;
	handleLoadComments: (bugId: number) => Promise<void>;
	handleAddComment: (
		bugId: number,
		payload: { text: string },
	) => Promise<void>;
	columnIndex?: number;
}

function BoardColumnView({
	id,
	title,
	count,
	bugs,
	users,
	currentUser,
	commentsByBug,
	loadingCommentsByBug,
	actionErrorByBug,
	handleSaveMeta,
	handleTransition,
	handleLoadComments,
	handleAddComment,
	columnIndex = 0,
}: BoardColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id });
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.section
			ref={setNodeRef}
			initial={
				shouldReduceMotion
					? false
					: {
							opacity: 0,
							y: 14,
						}
			}
			transition={
				shouldReduceMotion
					? undefined
					: {
							...springSoft,
							delay: columnIndex * 0.04,
						}
			}
			style={{ willChange: 'transform, opacity' }}
			animate={{
				y: 0,
				scale: isOver ? 1.01 : 1,
				opacity: 1,
			}}
			className={`flex h-full min-h-0 flex-col rounded-none border border-dashed p-4 transition-colors backdrop-blur-sm ${
				isOver
					? 'border-primary/50 bg-accent/40'
					: 'border-border/60 bg-card/40'
			}`}
		>
			<header className='mb-4 flex items-center justify-between'>
				<h2 className='text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground'>
					{title}
				</h2>
				<span className='rounded-none border border-dashed border-border/50 bg-secondary/35 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-secondary-foreground'>
					{count}
				</span>
			</header>
			<div className='thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1'>
				<AnimatePresence initial={false}>
					{bugs.map((bug) => (
						<BugCard
							key={bug.id}
							bug={bug}
							users={users}
							currentUser={currentUser}
							comments={commentsByBug[bug.id] ?? []}
							commentsLoading={
								loadingCommentsByBug[bug.id] ?? false
							}
							actionError={actionErrorByBug[bug.id]}
							handleSaveMeta={handleSaveMeta}
							handleTransition={handleTransition}
							handleLoadComments={handleLoadComments}
							handleAddComment={handleAddComment}
						/>
					))}
				</AnimatePresence>
			</div>
		</motion.section>
	);
}

export const BoardColumn = BoardColumnView;
