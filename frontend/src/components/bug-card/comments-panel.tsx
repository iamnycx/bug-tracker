import type { FormEvent } from 'react';
import type { Comment } from '../../api/types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

type CommentsPanelProps = {
	comments: Comment[];
	commentsLoading: boolean;
	commentText: string;
	canComment: boolean;
	onCommentChange: (value: string) => void;
	onSubmit: () => void;
};

export function CommentsPanel(props: CommentsPanelProps) {
	return (
		<div className='mt-3 space-y-3 border-t border-dashed border-border/50 pt-4 text-foreground'>
			{props.commentsLoading ? (
				<p className='text-xs text-muted-foreground'>
					Loading comments...
				</p>
			) : null}
			{!props.commentsLoading && props.comments.length === 0 ? (
				<p className='text-xs text-muted-foreground'>
					No comments yet.
				</p>
			) : null}
			{props.comments.map((comment) => (
				<p
					key={comment.id}
					className='rounded-none border border-dashed border-border/50 bg-background/35 backdrop-blur-sm px-3 py-2 text-xs leading-5 text-foreground'
				>
					{comment.text}
				</p>
			))}
			{props.canComment ? (
				<form
					className='space-y-2.5'
					onSubmit={(event: FormEvent<HTMLFormElement>) => {
						event.preventDefault();
						props.onSubmit();
					}}
				>
					<Textarea
						autoFocus
						rows={3}
						value={props.commentText}
						onChange={(e) => props.onCommentChange(e.target.value)}
						placeholder='Add comment'
						className='field-sizing-fixed min-h-[4.5rem] resize-none border-input/60 bg-background/55 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40'
					/>
					<Button type='submit' className='w-full rounded-none'>
						Add Comment
					</Button>
				</form>
			) : null}
		</div>
	);
}
