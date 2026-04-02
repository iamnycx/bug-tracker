import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CreateUserFormProps = {
	onSubmit: (payload: {
		name: string;
		email: string;
		password: string;
	}) => Promise<void>;
	onClose: () => void;
	disabled?: boolean;
};

export function CreateUserForm({
	onSubmit,
	onClose,
	disabled = false,
}: CreateUserFormProps) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!name.trim() || !email.trim() || password.trim().length < 8) {
			return;
		}

		await onSubmit({
			name: name.trim(),
			email: email.trim(),
			password: password.trim(),
		});
		setName('');
		setEmail('');
		setPassword('');
		onClose();
	}

	return (
		<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
			<label
				className='block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300'
				htmlFor='user-name'
			>
				New User
			</label>
			<div className='space-y-2'>
				<label
					className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
					htmlFor='user-name'
				>
					Name
				</label>
				<Input
					id='user-name'
					autoFocus
					placeholder='Name'
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
					htmlFor='user-email'
				>
					Email
				</label>
				<Input
					id='user-email'
					placeholder='Email'
					type='email'
					value={email}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setEmail(event.target.value)
					}
					disabled={disabled}
					className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
				/>
			</div>
			<div className='space-y-2'>
				<label
					className='block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400'
					htmlFor='user-password'
				>
					Initial Password
				</label>
				<Input
					id='user-password'
					placeholder='At least 8 characters'
					type='password'
					value={password}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setPassword(event.target.value)
					}
					disabled={disabled}
					className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'
				/>
			</div>
			<Button type='submit' className='w-full' disabled={disabled}>
				Add User
			</Button>
		</form>
	);
}
