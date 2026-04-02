import type {
	CreateBugPayload,
	CreateProjectPayload,
	CreateUserPayload,
	Project,
} from '../../api/types';
import { CreateBugForm } from '../create-bug-form';
import { CreateProjectForm } from '../create-project-form';
import { CreateUserForm } from '../create-user-form';
import { Modal } from '../modal';

type CreateModalsProps = {
	projects: Project[];
	submitting: boolean;
	showUserModal: boolean;
	showProjectModal: boolean;
	showBugModal: boolean;
	onCreateUser: (payload: CreateUserPayload) => Promise<void>;
	onCreateProject: (payload: CreateProjectPayload) => Promise<void>;
	onCreateBug: (payload: CreateBugPayload) => Promise<void>;
	onCloseUserModal: () => void;
	onCloseProjectModal: () => void;
	onCloseBugModal: () => void;
};

export function DashboardCreateModals(props: CreateModalsProps) {
	return (
		<>
			<Modal
				isOpen={props.showUserModal}
				title='Create New User'
				onClose={props.onCloseUserModal}
			>
				<CreateUserForm
					onSubmit={props.onCreateUser}
					onClose={props.onCloseUserModal}
					disabled={props.submitting}
				/>
			</Modal>
			<Modal
				isOpen={props.showProjectModal}
				title='Create New Project'
				onClose={props.onCloseProjectModal}
			>
				<CreateProjectForm
					onSubmit={props.onCreateProject}
					onClose={props.onCloseProjectModal}
					disabled={props.submitting}
				/>
			</Modal>
			<Modal
				isOpen={props.showBugModal}
				title='Create New Bug'
				onClose={props.onCloseBugModal}
			>
				<CreateBugForm
					projects={props.projects}
					onSubmit={props.onCreateBug}
					onClose={props.onCloseBugModal}
					disabled={props.submitting}
				/>
			</Modal>
		</>
	);
}
