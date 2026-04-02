import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Container from '../components/container';
import { useAuth } from '../lib/auth/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
	const { isAuthenticated, login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const redirectTo =
		(location.state as { from?: string } | null)?.from ?? '/dashboard';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);

		try {
			await login({ email: email.trim(), password });
			navigate(redirectTo, { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Request failed');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className='relative h-screen overflow-hidden bg-background text-foreground'>
			<Container className='flex h-full items-center px-4 py-6'>
				<div className='mx-auto flex h-full w-full max-w-md items-center justify-center'>
					<Card className='w-full rounded-none border border-dashed border-border/60 bg-background/85 p-6 backdrop-blur-sm'>
						<h1 className='mb-5 text-2xl text-center font-semibold tracking-[0.04em] text-foreground'>
							Login
						</h1>

						<form className='space-y-4' onSubmit={handleSubmit}>
							<div className='space-y-1'>
								<label className='block text-xs font-medium text-foreground'>
									Email
								</label>
								<Input
									type='email'
									value={email}
									onChange={(event) =>
										setEmail(event.target.value)
									}
									required
									placeholder='you@example.com'
									className='border-border/60 bg-background/55 backdrop-blur-sm'
								/>
							</div>

							<div className='space-y-1'>
								<label className='block text-xs font-medium text-foreground'>
									Password
								</label>
								<Input
									type='password'
									value={password}
									onChange={(event) =>
										setPassword(event.target.value)
									}
									required
									placeholder='Minimum 8 characters'
									className='border-border/60 bg-background/55 backdrop-blur-sm'
								/>
							</div>

							{error ? (
								<p className='text-xs text-destructive'>
									{error}
								</p>
							) : null}

							<Button
								type='submit'
								disabled={submitting}
								className='w-full rounded-none'
							>
								Sign In
							</Button>
						</form>

						<p className='mt-4 text-center text-xs text-muted-foreground'>
							Accounts are created by an admin. Contact your admin
							to receive login credentials.
						</p>
					</Card>
				</div>
			</Container>
		</div>
	);
}
