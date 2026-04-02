import type { Comment } from '../../api/types';

export type ActionErrorMap = Record<number, string>;
export type CommentsMap = Record<number, Comment[]>;
export type LoadingMap = Record<number, boolean>;
