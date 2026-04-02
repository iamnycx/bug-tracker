import { useEffect, useMemo, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDownIcon, ChevronUpIcon } from 'raster-react/dist/index.esm.js';
import { toast } from 'sonner';
import type { UpdateBugPayload } from '../../api/types';
import { cn } from '@/lib/utils';
import { shakeError, springFast } from '../animations';
import { Button } from '../ui/button';
import { Modal } from '../modal';
import { Textarea } from '../ui/textarea';
import { CommentsPanel } from './comments-panel';
import {
	formatPriorityLabel,
	NEXT_STATUS,
	nextStatusLabel,
	PRIORITY_INDICATORS,
} from './constants';
import { BugMetaForm } from './meta-form';
import type { BugCardProps } from './types';

function BugCardBody({
	bug,
	users,
	comments,
	commentsLoading,
	actionError,
	handleSaveMeta,
	handleTransition,
	handleLoadComments,
	handleAddComment,
}: BugCardProps) {
	const [assigneeId, setAssigneeId] = useState(
		bug.assignee_id?.toString() ?? '',
	);
	const [resolutionNote, setResolutionNote] = useState(
		bug.resolution_note ?? '',
	);
	const [commentText, setCommentText] = useState('');
	const [expanded, setExpanded] = useState(false);
	const [resolutionPromptOpen, setResolutionPromptOpen] = useState(false);
	const commentsPrimedRef = useRef(false);
	const saveTimerRef = useRef<number | null>(null);
	const next = useMemo(() => NEXT_STATUS[bug.status], [bug.status]);
	const initialAssignee = bug.assignee_id?.toString() ?? '';
	const initialResolution = bug.resolution_note ?? '';
	const shouldReduceMotion = useReducedMotion();
	const autosaveDebounceMs = 700;

	useEffect(() => {
		if (!expanded || commentsPrimedRef.current) return;
		void handleLoadComments(bug.id);
		commentsPrimedRef.current = true;
	}, [bug.id, expanded, handleLoadComments]);

	useEffect(() => {
		if (saveTimerRef.current !== null) {
			window.clearTimeout(saveTimerRef.current);
		}

		const payload: UpdateBugPayload = {};
		const trimmedResolution = resolutionNote.trim();

		if (assigneeId !== initialAssignee && assigneeId) {
			payload.assignee_id = Number(assigneeId);
		}

		if (trimmedResolution !== initialResolution && trimmedResolution) {
			payload.resolution_note = trimmedResolution;
		}

		if (Object.keys(payload).length === 0) {
			return undefined;
		}

		saveTimerRef.current = window.setTimeout(() => {
			void handleSaveMeta(bug.id, payload);
		}, autosaveDebounceMs);

		return () => {
			if (saveTimerRef.current !== null) {
				window.clearTimeout(saveTimerRef.current);
			}
		};
	}, [
		assigneeId,
		bug.id,
		handleSaveMeta,
		initialAssignee,
		initialResolution,
		resolutionNote,
	]);

	async function handleSubmitComment() {
		if (!commentText.trim()) return;
		await handleAddComment(bug.id, { text: commentText.trim() });
		setCommentText('');
	}

	async function requestTransition() {
		if (!next) {
			return;
		}

		if (next === 'in_progress') {
			if (!assigneeId.trim()) {
				toast.error(
					'Choose an assignee before moving this bug to In Progress.',
				);
				return;
			}
			await handleSaveMeta(bug.id, {
				assignee_id: Number(assigneeId),
			});
			await handleTransition(bug.id, next);
			return;
		}

		if (next === 'resolved') {
			const note = resolutionNote.trim();
			if (!note) {
				setResolutionPromptOpen(true);
				return;
			}
			await handleSaveMeta(bug.id, { resolution_note: note });
			await handleTransition(bug.id, next);
			return;
		}

		if (next === 'closed') {
			await handleTransition(bug.id, next);
		}
	}

	async function confirmResolutionFromModal() {
		const note = resolutionNote.trim();
		if (!note) {
			toast.error('Add a resolution note to continue.');
			return;
		}
		await handleSaveMeta(bug.id, { resolution_note: note });
		await handleTransition(bug.id, 'resolved');
		setResolutionPromptOpen(false);
	}

	return (
		<motion.div
			initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
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
					: { type: 'spring', stiffness: 260, damping: 24 }
			}
			style={{ willChange: 'transform, opacity' }}
		>
			<header className='mb-2 flex items-start justify-between gap-2'>
				<div>
					<p className='mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground'>
						Bug #{bug.id}
					</p>
					<div className='mb-2 flex items-center gap-2'>
						<span
							className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_INDICATORS[bug.priority]}`}
						/>
						<span className='text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
							{formatPriorityLabel(bug.priority)}
						</span>
					</div>
					<h3 className='text-sm font-semibold text-foreground'>
						{bug.title}
					</h3>
				</div>
				<div className='flex items-center gap-2'>
					<Button
						variant='ghost'
						size='icon-sm'
						className='rounded-none'
						onClick={(event) => {
							event.stopPropagation();
							setExpanded((prev) => !prev);
						}}
						aria-label={
							expanded
								? 'Collapse bug details'
								: 'Expand bug details'
						}
					>
						{expanded ? (
							<ChevronUpIcon size={18} />
						) : (
							<ChevronDownIcon size={18} />
						)}
					</Button>
				</div>
			</header>

			<div
				className={cn(
					'grid transition-[grid-template-rows] duration-200 ease-in-out',
					expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
					shouldReduceMotion && 'duration-0',
				)}
			>
				<div className='min-h-0 overflow-hidden'>
					<div
						className={cn(!expanded && 'pointer-events-none')}
						aria-hidden={!expanded}
						inert={!expanded}
					>
						<p className='mb-3 text-sm text-muted-foreground'>
							{bug.description}
						</p>
						<BugMetaForm
							status={bug.status}
							priority={bug.priority}
							users={users}
							assigneeId={assigneeId}
							resolutionNote={resolutionNote}
							nextStatus={next}
							onAssigneeChange={setAssigneeId}
							onResolutionChange={setResolutionNote}
							onRequestTransition={() => void requestTransition()}
							transitionLabel={nextStatusLabel(next)}
						/>

						<AnimatePresence initial={false}>
							{actionError ? (
								<motion.p
									className='mt-2 text-xs text-destructive'
									initial={
										shouldReduceMotion ? false : 'hidden'
									}
									animate={
										shouldReduceMotion
											? undefined
											: 'visible'
									}
									exit={
										shouldReduceMotion ? undefined : 'exit'
									}
									variants={
										shouldReduceMotion
											? undefined
											: shakeError
									}
								>
									{actionError}
								</motion.p>
							) : null}
						</AnimatePresence>
						<CommentsPanel
							comments={comments}
							commentsLoading={commentsLoading}
							commentText={commentText}
							canComment={bug.status !== 'closed'}
							onCommentChange={setCommentText}
							onSubmit={() => void handleSubmitComment()}
						/>
					</div>
				</div>
			</div>

			<Modal
				isOpen={resolutionPromptOpen}
				title='Resolution note required'
				onClose={() => setResolutionPromptOpen(false)}
			>
				<p className='mb-3 text-sm text-muted-foreground'>
					Enter a resolution note before moving this bug to Resolved.
				</p>
				<Textarea
					className='mb-4 min-h-28 border-zinc-700/60 bg-background/55 text-foreground placeholder:text-muted-foreground focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
					placeholder='Describe how this was resolved'
					value={resolutionNote}
					onChange={(e) => setResolutionNote(e.target.value)}
				/>
				<div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
					<Button
						type='button'
						variant='outline'
						className='rounded-none'
						onClick={() => setResolutionPromptOpen(false)}
					>
						Cancel
					</Button>
					<Button
						type='button'
						className='rounded-none'
						onClick={() => void confirmResolutionFromModal()}
					>
						Save & move to Resolved
					</Button>
				</div>
			</Modal>
		</motion.div>
	);
}

export function BugCard(props: BugCardProps) {
	const { bug, actionError, ...cardProps } = props;
	const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
		id: String(bug.id),
	});
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.article
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			layout
			initial={
				shouldReduceMotion
					? false
					: {
							opacity: 0,
							y: 14,
						}
			}
			animate={{
				scale: isDragging ? 0.98 : 1,
				opacity: isDragging ? 0.72 : 1,
				y: isDragging ? -6 : 0,
				rotateZ: isDragging ? -0.35 : 0,
			}}
			exit={
				shouldReduceMotion
					? undefined
					: {
							opacity: 0,
							scale: 0.96,
							y: -8,
						}
			}
			transition={springFast}
			style={{ willChange: 'transform, opacity' }}
			className={`cursor-grab rounded-none border border-dashed p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition backdrop-blur-sm active:cursor-grabbing ${isDragging ? 'border-primary/50 bg-background/70' : 'border-border/60 bg-background/55'}`}
		>
			<BugCardBody bug={bug} actionError={actionError} {...cardProps} />
		</motion.article>
	);
}
