import type { BugPriority, BugStatus, User } from '../../api/types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { formatPriorityLabel, PRIORITY_INDICATORS } from './constants';

type BugMetaFormProps = {
	status: BugStatus;
	priority: BugPriority;
	users: User[];
	assigneeId: string;
	resolutionNote: string;
	nextStatus: BugStatus | null;
	onAssigneeChange: (value: string) => void;
	onResolutionChange: (value: string) => void;
	onRequestTransition: () => void;
	transitionLabel: string;
};

export function BugMetaForm(props: BugMetaFormProps) {
	const showAssignee = props.status === 'open';
	const showResolutionEditor = props.status === 'in_progress';
	const showResolutionReadOnly =
		props.status === 'resolved' || props.status === 'closed';

	return (
		<div className='space-y-3 border-t border-dashed border-zinc-700/50 pt-4 backdrop-blur-sm'>
			<p className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400'>
				<span
					className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_INDICATORS[props.priority]}`}
				/>
				Priority: {formatPriorityLabel(props.priority)}
			</p>

			{showAssignee ? (
				<>
					<label className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-300'>
						Assignee
					</label>
					<Select
						modal={false}
						value={props.assigneeId || 'unassigned'}
						onValueChange={(value: string | null) =>
							props.onAssigneeChange(
								!value || value === 'unassigned' ? '' : value,
							)
						}
					>
						<SelectTrigger className='border-zinc-700/60 bg-zinc-900/40 backdrop-blur-sm text-zinc-50 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'>
							<SelectValue placeholder='Unassigned'>
								{(value: string | null) => {
									if (!value || value === 'unassigned') {
										return 'Unassigned';
									}

									return (
										props.users.find(
											(user) =>
												String(user.id) ===
												String(value),
										)?.name ?? 'Unassigned'
									);
								}}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className='thin-scrollbar'>
							<SelectItem value='unassigned'>Unassigned</SelectItem>
							{props.users.map((user) => (
								<SelectItem
									key={user.id}
									value={String(user.id)}
								>
									{user.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className='text-[10px] leading-relaxed text-muted-foreground'>
						Assign someone before moving this bug to In Progress.
					</p>
				</>
			) : null}

			{showResolutionEditor ? (
				<>
					<label className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-300'>
						Resolution note
					</label>
					<Textarea
						className='min-h-24 border-zinc-700/60 bg-zinc-900/40 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
						placeholder='Required before moving to Resolved'
						value={props.resolutionNote}
						onChange={(e) =>
							props.onResolutionChange(e.target.value)
						}
					/>
					<p className='text-[10px] leading-relaxed text-muted-foreground'>
						Add a resolution note before moving this bug to Resolved.
					</p>
				</>
			) : null}

			{showResolutionReadOnly && props.resolutionNote.trim() ? (
				<div className='space-y-1'>
					<p className='text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'>
						Resolution
					</p>
					<p className='rounded-none border border-dashed border-zinc-700/50 bg-zinc-950/40 px-3 py-2 text-xs leading-relaxed text-zinc-200'>
						{props.resolutionNote}
					</p>
				</div>
			) : null}

			<Button
				className='w-full rounded-none'
				disabled={!props.nextStatus}
				onClick={props.onRequestTransition}
			>
				{props.transitionLabel}
			</Button>
		</div>
	);
}
