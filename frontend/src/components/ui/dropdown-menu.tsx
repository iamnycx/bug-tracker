import { Menu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = Menu.Root;
const DropdownMenuTrigger = Menu.Trigger;

function DropdownMenuContent({
	className,
	...props
}: ComponentProps<typeof Menu.Popup>) {
	return (
		<Menu.Portal>
			<Menu.Positioner sideOffset={8} align='end'>
				<Menu.Popup
					className={cn(
						'min-w-44 rounded-none border border-dashed border-border bg-popover p-1 text-popover-foreground shadow-none outline-none',
						className,
					)}
					{...props}
				/>
			</Menu.Positioner>
		</Menu.Portal>
	);
}

function DropdownMenuItem({
	className,
	...props
}: ComponentProps<typeof Menu.Item>) {
	return (
		<Menu.Item
			className={cn(
				'flex cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: ComponentProps<typeof Menu.Separator>) {
	return (
		<Menu.Separator
			className={cn('my-1 h-px bg-border', className)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
};
