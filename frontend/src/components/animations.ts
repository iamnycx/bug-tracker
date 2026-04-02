import type { Transition, Variants } from 'motion/react';

export const springFast: Transition = {
	type: 'spring',
	stiffness: 360,
	damping: 28,
};

export const springSoft: Transition = {
	type: 'spring',
	stiffness: 240,
	damping: 26,
};

export const fadeSlideIn: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: springSoft,
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: { duration: 0.18, ease: 'easeOut' },
	},
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.04,
		},
	},
};

export const shakeError: Variants = {
	hidden: { opacity: 0, x: -6 },
	visible: {
		opacity: 1,
		x: [0, -6, 6, -5, 4, -2, 0],
		transition: { duration: 0.4, ease: 'easeOut' },
	},
	exit: {
		opacity: 0,
		x: 6,
		transition: { duration: 0.16, ease: 'easeIn' },
	},
};
