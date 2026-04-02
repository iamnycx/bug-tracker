import { useCallback } from 'react';
import {
	DndContext,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import type { DragEndEvent } from '@dnd-kit/core';
import type {
	Bug,
	BugStatus,
	Comment,
	UpdateBugPayload,
	User,
} from '../api/types';
import { BoardColumn } from './board-column';
import {
	bugsToKanbanColumns,
	KANBAN_COLUMN_NAMES,
	KANBAN_COLUMN_ORDER,
} from './kanban-config';

interface KanbanBoardProps {
	bugs: Bug[];
	users: User[];
	currentUser: User;
	commentsByBug: Record<number, Comment[]>;
	loadingCommentsByBug: Record<number, boolean>;
	actionErrorByBug: Record<number, string>;
	handleTransition: (bugId: number, status: BugStatus) => Promise<void>;
	handleSaveMeta: (bugId: number, payload: UpdateBugPayload) => Promise<void>;
	handleLoadComments: (bugId: number) => Promise<void>;
	handleAddComment: (
		bugId: number,
		payload: { text: string },
	) => Promise<void>;
}

function KanbanBoardView(props: KanbanBoardProps) {
	const {
		bugs,
		users,
		currentUser,
		commentsByBug,
		loadingCommentsByBug,
		actionErrorByBug,
		handleTransition,
		handleSaveMeta,
		handleLoadComments,
		handleAddComment,
	} = props;
	const columns = bugsToKanbanColumns(bugs);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
	);
	const shouldReduceMotion = useReducedMotion();

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over) return;

			const bugId = Number(active.id);
			const newStatus = over.id as BugStatus;

			// Find the bug and its current status
			const bug = bugs.find((b) => b.id === bugId);
			if (!bug || bug.status === newStatus) return;

			const currentStatusIndex = KANBAN_COLUMN_ORDER.indexOf(bug.status);
			const nextStatusIndex = KANBAN_COLUMN_ORDER.indexOf(newStatus);

			if (
				currentStatusIndex === -1 ||
				nextStatusIndex === -1 ||
				nextStatusIndex !== currentStatusIndex + 1
			) {
				toast.error('Bugs can only move forward one step at a time.');
				return;
			}

			if (newStatus === 'in_progress' && !bug.assignee_id) {
				toast.error(
					'Choose an assignee on the bug card before moving to In Progress.',
				);
				return;
			}

			if (newStatus === 'resolved') {
				const note = bug.resolution_note?.trim();
				if (!note) {
					toast.error(
						'Add a resolution note on the bug card before moving to Resolved.',
					);
					return;
				}
			}

			void handleTransition(bugId, newStatus);
		},
		[bugs, handleTransition],
	);

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
				collisionDetection={closestCorners}
			>
				<motion.main
					className='grid h-full min-h-0 gap-4 md:grid-cols-2 xl:grid-cols-4'
					initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
					animate={
						shouldReduceMotion
							? undefined
							: {
									opacity: 1,
									y: 0,
								}
					}
					transition={
						shouldReduceMotion
							? undefined
							: { type: 'spring', stiffness: 220, damping: 24 }
					}
					style={{ willChange: 'transform, opacity' }}
				>
					{KANBAN_COLUMN_ORDER.map((status) => (
						<BoardColumn
							key={status}
							columnIndex={KANBAN_COLUMN_ORDER.indexOf(status)}
							id={status}
							title={KANBAN_COLUMN_NAMES[status]}
							count={columns[status].length}
							bugs={columns[status]}
							users={users}
							currentUser={currentUser}
							commentsByBug={commentsByBug}
							loadingCommentsByBug={loadingCommentsByBug}
							actionErrorByBug={actionErrorByBug}
							handleSaveMeta={handleSaveMeta}
							handleTransition={handleTransition}
							handleLoadComments={handleLoadComments}
							handleAddComment={handleAddComment}
						/>
					))}
				</motion.main>
			</DndContext>
		</>
	);
}

export const KanbanBoard = KanbanBoardView;
