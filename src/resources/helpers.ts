import type { MethodForPath, PathKey, RequestOptions } from '../core/types';

export type Without<T, K extends keyof T> = Omit<T, K>;
export type BodyInput<Path extends PathKey, Method extends MethodForPath<Path>> = NonNullable<
  RequestOptions<Path, Method>['body']
>;

export const toPathParam = (value: string | number): string => String(value);
