import type { BugPriority } from '../api/types';
import {
	formatPriorityLabel,
	PRIORITY_INDICATORS,
} from './bug-card/constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const PRIORITIES: BugPriority[] = ['low', 'medium', 'high', 'critical'];

type CreateBugPriorityProps = {
	value: BugPriority;
	onChange: (value: BugPriority) => void;
	disabled?: boolean;
};

export function CreateBugPriority({
	value,
	onChange,
	disabled,
}: CreateBugPriorityProps) {
	return (
		<Select
			modal={false}
			value={value}
			onValueChange={(next: string | null) => {
				if (!next) return;
				onChange(next as BugPriority);
			}}
			disabled={disabled}
		>
			<SelectTrigger className='border-zinc-700/60 bg-background/55 backdrop-blur-sm text-zinc-50 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30'>
				<SelectValue placeholder='Select priority'>
					{(selected: string | null) => {
						if (!selected) return 'Select priority';
						const p = selected as BugPriority;
						return (
							<span className='flex items-center gap-2'>
								<span
									className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_INDICATORS[p]}`}
								/>
								{formatPriorityLabel(p)}
							</span>
						);
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent className='thin-scrollbar'>
				{PRIORITIES.map((priority) => (
					<SelectItem key={priority} value={priority}>
						<span className='flex items-center gap-2'>
							<span
								className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_INDICATORS[priority]}`}
							/>
							{formatPriorityLabel(priority)}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
