import type { User, Project } from '../api/types';

type UsersProjectsModalProps = {
	users: User[];
	projects: Project[];
	isAdmin: boolean;
	actionPending?: boolean;
	onBlockUser?: (userId: number) => Promise<void>;
	onUnblockUser?: (userId: number) => Promise<void>;
};

export function UsersProjectsModal({
	users,
	projects,
	isAdmin,
	actionPending = false,
	onBlockUser,
	onUnblockUser,
}: UsersProjectsModalProps) {
	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-3'>
					Users
				</h3>
				{users.length === 0 ? (
					<p className='text-xs text-muted-foreground'>
						No users yet.
					</p>
				) : (
					<div className='grid grid-cols-2 gap-2'>
						{users.map((user) => (
							<div
								key={user.id}
								className='flex flex-col gap-2 rounded-none border border-dashed border-border bg-card/40 backdrop-blur-sm px-3 py-2'
							>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-xs font-medium text-foreground'>
											{user.name}
										</p>
										<p className='text-[10px] text-muted-foreground'>
											{user.email}
										</p>
									</div>
									<span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500'>
										{user.role}
									</span>
								</div>
								{isAdmin ? (
									<>
										<p className='text-[10px] text-zinc-400'>
											Credentials: {user.email} /{' '}
											{user.credential_password ??
												'Not available'}
										</p>
										<div className='flex justify-end'>
											<button
												type='button'
												disabled={actionPending}
												onClick={() => {
													if (user.is_blocked) {
														void onUnblockUser?.(
															user.id,
														);
														return;
													}
													void onBlockUser?.(user.id);
												}}
												className='text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50'
											>
												{user.is_blocked
													? 'Unblock User'
													: 'Block User'}
											</button>
										</div>
									</>
								) : null}
								{user.is_blocked ? (
									<p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive'>
										Blocked
									</p>
								) : null}
							</div>
						))}
					</div>
				)}
			</div>

			<div className='border-t border-dashed border-border pt-6'>
				<h3 className='text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-3'>
					Projects
				</h3>
				{projects.length === 0 ? (
					<p className='text-xs text-muted-foreground'>
						No projects yet.
					</p>
				) : (
					<div className='grid grid-cols-2 gap-2'>
						{projects.map((project) => (
							<div
								key={project.id}
								className='rounded-none border border-dashed border-border bg-card/40 backdrop-blur-sm p-3'
							>
								<p className='text-xs font-medium text-foreground mb-1'>
									{project.name}
								</p>
								{project.description && (
									<p className='text-[10px] text-muted-foreground line-clamp-2'>
										{project.description}
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
