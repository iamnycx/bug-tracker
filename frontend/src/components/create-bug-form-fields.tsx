import type { BugPriority, Project } from '../api/types';
import { CreateBugPriority } from './create-bug-priority';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ChangeEvent } from 'react';

type CreateBugFormFieldsProps = {
	title: string;
	description: string;
	projectId: string;
	priority: BugPriority;
	hasProjects: boolean;
	disabled: boolean;
	onTitleChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onProjectChange: (value: string) => void;
	onPriorityChange: (value: BugPriority) => void;
	projects: Project[];
};

export function CreateBugFormFields({
	title,
	description,
	projectId,
	priority,
	hasProjects,
	disabled,
	onTitleChange,
	onDescriptionChange,
	onProjectChange,
	onPriorityChange,
	projects,
}: CreateBugFormFieldsProps) {
	return (
		<>
			<label className='block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300'>
				New Bug
			</label>
			<div className='flex flex-col gap-4'>
				<div className='space-y-2'>
					<label
						className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
						htmlFor='bug-title'
					>
						Title
					</label>
					<Input
						id='bug-title'
						autoFocus
						placeholder='Title'
						value={title}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							onTitleChange(event.target.value)
						}
						disabled={disabled}
						className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
					/>
				</div>
				<div className='space-y-2'>
					<label
						className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
						htmlFor='bug-description'
					>
						Description
					</label>
					<Textarea
						id='bug-description'
						className='min-h-24 border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
						placeholder='Description'
						value={description}
						onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
							onDescriptionChange(event.target.value)
						}
						disabled={disabled}
					/>
				</div>
				<div className='space-y-2'>
					<label className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'>
						Project
					</label>
					<Select
						modal={false}
						value={projectId}
						onValueChange={(next: string | null) => {
							onProjectChange(next ?? '');
						}}
						disabled={disabled || !hasProjects}
					>
						<SelectTrigger className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'>
							<SelectValue placeholder='Select project' />
						</SelectTrigger>
						<SelectContent className='thin-scrollbar'>
							{projects.map((project) => (
								<SelectItem
									key={project.id}
									value={String(project.id)}
								>
									{project.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className='space-y-2'>
					<label className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'>
						Priority
					</label>
					<CreateBugPriority
						value={priority}
						onChange={onPriorityChange}
						disabled={disabled}
					/>
				</div>
			</div>
		</>
	);
}
