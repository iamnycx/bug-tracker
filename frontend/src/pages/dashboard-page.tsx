import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Container from '../components/container';
import { DashboardBoardView } from '../components/dashboard/board-view';
import { DashboardCreateModals } from '../components/dashboard/create-modals';
import { useAuth } from '../lib/auth/use-auth';
import { useDashboardData } from '../lib/dashboard';
import { Button } from '@/components/ui/button';
import { DashboardActionBar } from '@/components/dashboard/action-bar';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/modal';
import { UsersProjectsModal } from '@/components/users-projects-modal';
import {
	fadeSlideIn,
	shakeError,
	staggerContainer,
} from '@/components/animations';
import { LogOutIcon } from 'raster-react/dist/index.esm.js';

export default function DashboardPage() {
	const {
		users,
		projects,
		bugs,
		commentsByBug,
		loadingCommentsByBug,
		loading,
		submitting,
		error,
		actionErrorByBug,
		handleCreateUser,
		handleCreateProject,
		handleCreateBug,
		handleBlockUser,
		handleUnblockUser,
		handleSaveMeta,
		handleTransition,
		handleLoadComments,
		handleAddComment,
	} = useDashboardData();
	const { user, logout } = useAuth();
	const [showUserModal, setShowUserModal] = useState(false);
	const [showUsersProjects, setShowUsersProjects] = useState(false);
	const [showProjectModal, setShowProjectModal] = useState(false);
	const [showBugModal, setShowBugModal] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	if (!user) {
		return <Navigate to='/login' replace />;
	}

	return (
		<motion.div
			className='h-screen overflow-hidden bg-background text-foreground'
			initial='hidden'
			animate='visible'
			variants={shouldReduceMotion ? undefined : staggerContainer}
		>
			<Container className='h-full px-4 py-5 md:px-8 md:py-6'>
				<div className='flex h-full min-h-0 flex-col gap-5'>
					<motion.div
						className='flex items-center justify-between gap-3'
						variants={shouldReduceMotion ? undefined : fadeSlideIn}
					>
						<p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>
							{user.name} ({user.role})
						</p>
						<Button
							variant='outline'
							size='xs'
							onClick={logout}
							className='rounded-none'
						>
							<LogOutIcon size={14} />
							Logout
						</Button>
					</motion.div>

					<motion.div
						variants={shouldReduceMotion ? undefined : fadeSlideIn}
					>
						<DashboardActionBar
							disabled={submitting}
							disableNewBug={projects.length === 0}
							isAdmin={user.role === 'admin'}
							onViewUsersProjects={() =>
								setShowUsersProjects(true)
							}
							onNewUser={() => setShowUserModal(true)}
							onNewProject={() => setShowProjectModal(true)}
							onNewBug={() => setShowBugModal(true)}
						/>
					</motion.div>

					<DashboardCreateModals
						projects={projects}
						submitting={submitting}
						showUserModal={showUserModal}
						showProjectModal={showProjectModal}
						showBugModal={showBugModal}
						onCreateUser={handleCreateUser}
						onCreateProject={handleCreateProject}
						onCreateBug={handleCreateBug}
						onCloseUserModal={() => setShowUserModal(false)}
						onCloseProjectModal={() => setShowProjectModal(false)}
						onCloseBugModal={() => setShowBugModal(false)}
					/>

					<Modal
						isOpen={showUsersProjects}
						title='Users & Projects'
						onClose={() => setShowUsersProjects(false)}
					>
						<UsersProjectsModal
							users={users}
							projects={projects}
							isAdmin={user.role === 'admin'}
							actionPending={submitting}
							onBlockUser={handleBlockUser}
							onUnblockUser={handleUnblockUser}
						/>
					</Modal>

					<AnimatePresence initial={false}>
						{error ? (
							<motion.div
								key='dashboard-error'
								variants={
									shouldReduceMotion ? undefined : shakeError
								}
								initial={shouldReduceMotion ? false : 'hidden'}
								animate={
									shouldReduceMotion ? undefined : 'visible'
								}
								exit={shouldReduceMotion ? undefined : 'exit'}
							>
								<Card className='border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm'>
									{error}
								</Card>
							</motion.div>
						) : null}
					</AnimatePresence>

					<motion.div
						className='min-h-0 flex-1'
						variants={shouldReduceMotion ? undefined : fadeSlideIn}
					>
						<DashboardBoardView
							loading={loading}
							bugs={bugs}
							users={users}
							currentUser={user}
							commentsByBug={commentsByBug}
							loadingCommentsByBug={loadingCommentsByBug}
							actionErrorByBug={actionErrorByBug}
							onTransition={handleTransition}
							onSaveMeta={handleSaveMeta}
							onLoadComments={handleLoadComments}
							onAddComment={handleAddComment}
						/>
					</motion.div>
				</div>
			</Container>
		</motion.div>
	);
}
