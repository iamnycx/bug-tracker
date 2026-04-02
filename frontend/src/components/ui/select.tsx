import type { ComponentProps } from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from 'raster-react/dist/index.esm.js';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectLabel = SelectPrimitive.GroupLabel;

function SelectTrigger({
	className,
	children,
	...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			data-slot='select-trigger'
			className={cn(
				'flex h-9 w-full items-center justify-between rounded-none border border-dashed border-zinc-700 bg-zinc-900/85 px-3 text-sm text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400/30 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-zinc-500',
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon>
				<ChevronDownIcon size={14} className='text-muted-foreground' />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	...props
}: ComponentProps<typeof SelectPrimitive.Popup>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				className='z-10000'
				side='bottom'
				sideOffset={6}
				align='start'
				alignItemWithTrigger={false}
			>
				<SelectPrimitive.Popup
					data-slot='select-content'
					className={cn(
						'relative z-10000 max-h-80 min-w-(--anchor-width) overflow-hidden rounded-none border border-dashed border-zinc-700/60 bg-zinc-900/60 backdrop-blur-xl text-zinc-100 shadow-[0_14px_32px_rgba(0,0,0,0.35)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
						className,
					)}
					{...props}
				>
					<SelectPrimitive.ScrollUpArrow className='flex cursor-default items-center justify-center py-1'>
						<ChevronUpIcon size={14} />
					</SelectPrimitive.ScrollUpArrow>
					<SelectPrimitive.List className='thin-scrollbar flex min-w-(--anchor-width) flex-col gap-0.5 px-1.5 py-2'>
						{children}
					</SelectPrimitive.List>
					<SelectPrimitive.ScrollDownArrow className='flex cursor-default items-center justify-center py-1'>
						<ChevronDownIcon size={14} />
					</SelectPrimitive.ScrollDownArrow>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot='select-item'
			className={cn(
				'relative flex w-full cursor-default select-none items-center rounded-none px-2 py-1.5 pr-8 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 focus:bg-zinc-800 focus:text-zinc-50',
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<span className='absolute right-2 flex h-3.5 w-3.5 items-center justify-center'>
				<SelectPrimitive.ItemIndicator>
					<CheckIcon size={12} />
				</SelectPrimitive.ItemIndicator>
			</span>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='select-separator'
			className={cn('-mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
