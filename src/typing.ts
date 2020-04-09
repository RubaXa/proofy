export type XType =
	| number[]
	| string[]
	| ((value: any) => any)
;

export type XArgSpec<N extends string, T extends XType> = {
	name: N;
	type: T;
};

export type XArgsSpec = {
	[arg:string]: XArgSpec<any, any>;
};

export type XArgs<T extends XArgsSpec> = {
	[K in keyof T]: T[K]['type'] extends any[]
		? T[K]['type'][number]
		: ReturnType<T[K]['type']>
	;
};

export type XUnsubsribe<D extends string> = () => D;

export type XInit = {
	name: string;
	group: XGroup<any, any, any>;
};

export interface XEvent<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
> {
	ts: number;
	target: XEmitter<D, A, I>;
	data: XArgs<A>;
};

export interface XEmitter<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
> {
	(args: XArgs<A>): void
	$args: () => A;
	$path: () => string[];
	$clone: <NI extends XInit = I>(init?: NI) => XEmitter<D, A, NI>;
	$descr: (data?: XArgs<A>) => D;
	$on: (listener: (xevt: XEvent<D, A, I>) => void) => XUnsubsribe<D>;
	$filter: (fn: (data: XArgs<A>) => boolean) => Pick<this, '$on'>;
	$isEvent: (xevt: XEvent<any, any, any>) => xevt is XEvent<D, A, I>;
};

export type XGroupSpec = {
	[name:string]: XEmitter<any, any, any> | XGroup<any, any, any>;
};

export type XGroup<
	D extends string,
	G extends XGroupSpec,
	I extends XInit,
> = G & {
	$descr: () => D;
	$clone: <NI extends XInit = I>(init?: NI) => XGroup<D, G, NI>;
	$path: () => string[];
	$on: (listener: (xevt: XGroupEvent<G>) => void) => XUnsubsribe<D>;
};

export type XGroupEvent<G extends XGroupSpec> = {
	[K in keyof G]: G[K] extends XEmitter<infer D, infer A, infer I>
		? XEvent<D, A, I>
		: XGroupEvent<G[K]>
	;
}[keyof G];