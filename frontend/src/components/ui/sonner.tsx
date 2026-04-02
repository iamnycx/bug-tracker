import { Toaster as Sonner, type ToasterProps } from 'sonner';
import type { CSSProperties } from 'react';

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			{...props}
			className='toaster group z-1000'
			closeButton={false}
			icons={{
				success: null,
				info: null,
				warning: null,
				error: null,
				loading: null,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as CSSProperties
			}
			toastOptions={{
				closeButton: false,
				classNames: {
					toast: 'cn-toast',
					closeButton: 'hidden',
				},
			}}
		/>
	);
};

export { Toaster };
