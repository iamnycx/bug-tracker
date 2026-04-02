import { useMemo, useState, type FormEvent } from 'react';
import type { BugPriority, Project } from '../api/types';
import { CreateBugFormFields } from './create-bug-form-fields';
import { Button } from '@/components/ui/button';

type CreateBugFormProps = {
	projects: Project[];
	onSubmit: (payload: {
		title: string;
		description: string;
		project_id: number;
		priority: BugPriority;
	}) => Promise<void>;
	onClose: () => void;
	disabled?: boolean;
};

export function CreateBugForm({
	projects,
	onSubmit,
	onClose,
	disabled = false,
}: CreateBugFormProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [projectId, setProjectId] = useState('');
	const [priority, setPriority] = useState<BugPriority>('medium');

	const hasProjects = useMemo(() => projects.length > 0, [projects.length]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!title.trim() || !description.trim() || !projectId) {
			return;
		}

		await onSubmit({
			title: title.trim(),
			description: description.trim(),
			project_id: Number(projectId),
			priority,
		});

		setTitle('');
		setDescription('');
		setProjectId('');
		setPriority('medium');
		onClose();
	}

	return (
		<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
			<CreateBugFormFields
				title={title}
				description={description}
				projectId={projectId}
				priority={priority}
				hasProjects={hasProjects}
				disabled={disabled}
				onTitleChange={setTitle}
				onDescriptionChange={setDescription}
				onProjectChange={setProjectId}
				onPriorityChange={setPriority}
				projects={projects}
			/>
			<Button
				type='submit'
				className='w-full'
				disabled={disabled || !hasProjects}
			>
				Add Bug
			</Button>
			{!hasProjects ? (
				<p className='text-xs text-amber-200'>
					Create a project before creating bugs.
				</p>
			) : null}
		</form>
	);
}
