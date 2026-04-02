import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export default function Container({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <div className={cn(className, 'w-full')}>{children}</div>;
}
