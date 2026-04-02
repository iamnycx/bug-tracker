import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CreateProjectFormProps = {
	onSubmit: (payload: { name: string; description: string }) => Promise<void>;
	onClose: () => void;
	disabled?: boolean;
};

export function CreateProjectForm({
	onSubmit,
	onClose,
	disabled = false,
}: CreateProjectFormProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!name.trim()) {
			return;
		}

		await onSubmit({ name: name.trim(), description: description.trim() });
		setName('');
		setDescription('');
		onClose();
	}

	return (
		<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
			<label
				className='block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300'
				htmlFor='project-name'
			>
				New Project
			</label>
			<div className='space-y-2'>
				<label
					className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
					htmlFor='project-name'
				>
					Project Name
				</label>
				<Input
					id='project-name'
					autoFocus
					placeholder='Project name'
					value={name}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setName(event.target.value)
					}
					disabled={disabled}
					className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
				/>
			</div>
			<div className='space-y-2'>
				<label
					className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
					htmlFor='project-description'
				>
					Description
				</label>
				<Input
					id='project-description'
					placeholder='Description'
					value={description}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setDescription(event.target.value)
					}
					disabled={disabled}
					className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
				/>
			</div>
			<Button type='submit' className='w-full' disabled={disabled}>
				Add Project
			</Button>
		</form>
	);
}
