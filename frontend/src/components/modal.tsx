import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { XIcon } from 'raster-react/dist/index.esm.js';

interface ModalProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement | null>(null);
	const shouldReduceMotion = useReducedMotion();

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onClose();
			}
		}

		if (!isOpen) {
			return undefined;
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			const firstField = dialogRef.current?.querySelector<HTMLElement>(
				'input:not([type="hidden"]), textarea, select',
			);
			firstField?.focus({ preventScroll: true });
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, [isOpen]);

	return (
		<AnimatePresence initial={false}>
			{isOpen ? (
				<motion.div
					className='fixed inset-0 z-500 flex items-center justify-center px-4'
					initial={shouldReduceMotion ? false : { opacity: 0 }}
					animate={shouldReduceMotion ? undefined : { opacity: 1 }}
					exit={shouldReduceMotion ? undefined : { opacity: 0 }}
				>
					<motion.div
						className='absolute inset-0 bg-background/75 backdrop-blur-[3px]'
						onClick={onClose}
						aria-hidden='true'
						initial={shouldReduceMotion ? false : { opacity: 0 }}
						animate={
							shouldReduceMotion ? undefined : { opacity: 1 }
						}
						exit={shouldReduceMotion ? undefined : { opacity: 0 }}
					/>

					<motion.div
						ref={dialogRef}
						role='dialog'
						aria-modal='true'
						aria-labelledby={titleId}
						className='relative z-510 w-full max-w-lg rounded-none border border-dashed border-border/60 bg-background/92 backdrop-blur-xl text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.35)]'
						initial={
							shouldReduceMotion
								? false
								: {
										opacity: 0,
										y: 18,
										scale: 0.98,
									}
						}
						animate={
							shouldReduceMotion
								? undefined
								: {
										opacity: 1,
										y: 0,
										scale: 1,
									}
						}
						exit={
							shouldReduceMotion
								? undefined
								: {
										opacity: 0,
										y: 14,
										scale: 0.98,
									}
						}
						transition={{
							type: 'spring',
							stiffness: 260,
							damping: 24,
						}}
						style={{ willChange: 'transform, opacity' }}
					>
						<div className='flex items-center justify-between border-b border-dashed border-border/60 px-7 py-5'>
							<h2
								id={titleId}
								className='text-sm font-semibold uppercase tracking-[0.18em] text-foreground'
							>
								{title}
							</h2>
							<button
								type='button'
								onClick={onClose}
								className='inline-flex h-9 w-9 items-center justify-center rounded-none border border-dashed border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-background/70 hover:text-foreground'
								aria-label='Close dialog'
							>
								<XIcon size={16} />
							</button>
						</div>

						<div className='px-7 py-6'>{children}</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
