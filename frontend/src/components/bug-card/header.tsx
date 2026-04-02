import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Bug } from '../../api/types';
import { StatusBadge } from '../status-badge';

type BugCardHeaderProps = {
	bug: Bug;
	attributes: DraggableAttributes;
	listeners: SyntheticListenerMap | undefined;
};

export function BugCardHeader({
	bug,
	attributes,
	listeners,
}: BugCardHeaderProps) {
	return (
		<header className='mb-2 flex items-start justify-between gap-2'>
			<div>
				<p className='mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-400'>
					Bug #{bug.id}
				</p>
				<h3 className='text-sm font-semibold text-zinc-100'>
					{bug.title}
				</h3>
			</div>
			<div className='flex items-center gap-2'>
				<StatusBadge status={bug.status} />
				<button
					type='button'
					className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white'
					aria-label={`Drag ${bug.title}`}
					{...attributes}
					{...listeners}
				>
					<svg
						aria-hidden='true'
						className='h-4 w-4'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path d='M7 4a1 1 0 112 0v2a1 1 0 11-2 0V4zm4 0a1 1 0 112 0v2a1 1 0 11-2 0V4zM7 9a1 1 0 112 0v2a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v2a1 1 0 11-2 0V9zm-4 5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm4 0a1 1 0 112 0v2a1 1 0 11-2 0v-2z' />
					</svg>
				</button>
			</div>
		</header>
	);
}
