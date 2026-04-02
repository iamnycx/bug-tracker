import {
	FolderIcon,
	GripIcon,
	UserIcon,
	EyeIcon,
} from 'raster-react/dist/index.esm.js';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

type ActionBarProps = {
	disabled: boolean;
	disableNewBug: boolean;
	isAdmin: boolean;
	onNewUser: () => void;
	onNewProject: () => void;
	onNewBug: () => void;
	onViewUsersProjects: () => void;
};

export function DashboardActionBar({
	disabled,
	disableNewBug,
	isAdmin,
	onNewUser,
	onNewProject,
	onViewUsersProjects,
	onNewBug,
}: ActionBarProps) {
	return (
		<Card className='flex items-center flex-row justify-between border border-dashed border-border bg-card px-5 py-4'>
			<h1 className='text-lg font-semibold tracking-[0.08em] text-foreground'>
				Bug Tracker
			</h1>
			<div className='flex items-center gap-2'>
				<Button
					variant='outline'
					className='rounded-none'
					onClick={onViewUsersProjects}
					disabled={disabled}
					title='View all users and projects'
				>
					<EyeIcon size={14} />
					View
				</Button>
				{isAdmin ? (
					<>
						<Button
							variant='outline'
							className='rounded-none'
							onClick={onNewUser}
							disabled={disabled}
						>
							<UserIcon size={14} />
							New User
						</Button>
						<Button
							variant='outline'
							className='rounded-none'
							onClick={onNewProject}
							disabled={disabled}
						>
							<GripIcon size={14} />
							New Project
						</Button>
					</>
				) : null}
				{isAdmin ? (
					<Button
						variant='outline'
						className='rounded-none'
						onClick={onNewBug}
						disabled={disabled || disableNewBug}
					>
						<FolderIcon size={14} />
						New Bug
					</Button>
				) : null}
			</div>
		</Card>
	);
}
