import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex shrink-0 items-center justify-center rounded-md border border-dashed border-transparent text-xs font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:opacity-90',
				outline:
					'border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
				destructive:
					'border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 gap-1.5 px-3',
				xs: 'h-7 gap-1 px-2 text-[11px]',
				sm: 'h-8 gap-1.5 px-2.5',
				lg: 'h-10 gap-2 px-4 text-sm',
				icon: 'size-8',
				'icon-xs': 'size-7 [&_svg:not([class*="size-"])]:size-3',
				'icon-sm': 'size-8',
				'icon-lg': 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type ButtonProps = ComponentPropsWithoutRef<typeof ButtonPrimitive> &
	VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant = 'default', size = 'default', ...props },
	ref,
) {
	return (
		<ButtonPrimitive
			ref={ref}
			data-slot='button'
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
});

export { Button };
