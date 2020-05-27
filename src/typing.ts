export type XType = ((value: any) => any);

export type XTypeEnumValues = {
	[key:string]: string
}

export type XArgSpec<N extends string, T extends XType> = Readonly<{
	name: N;
	type: T;
}>;

export type XArgEnumSpec<N extends string, T extends XTypeEnumValues> = Readonly<{
	name: N;
	values: T;
}>;

export type XArgsSpec = {
	[arg:string]: XArgSpec<any, any> | XArgEnumSpec<any, any>;
};

export type XArgType<A> = A extends XArgSpec<any, infer T>
	? ReturnType<T>
	: (A extends XArgEnumSpec<any, infer T>
		? keyof T
		: never
	)
;

export type XArgs<T extends XArgsSpec> = Readonly<{
	[K in keyof T]: XArgType<T[K]>;
}>;

export type XDescrArgs<T extends XArgsSpec> = Readonly<{
	[K in keyof T]: {
		name: T[K]['name'];
		value: XArgType<T[K]>;
	};
}>;

export type XUnsubsribe = () => void;

export type XInit = {
	name: string;
	group: XGroup<string, XGroupSpec, XInit>;
};

export type XEvent<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
> = Readonly<{
	ts: number;
	target: XEmitter<D, A, I>;
	data: XArgs<A>;
}>;

export interface XEmitter<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
> {
	(args: XArgs<A>): void;
	$args: () => A;
	$path: () => string[];
	$group: () => XGroup<string, XGroupSpec, XInit> | undefined;
	$clone: <NI extends XInit = I>(init?: NI) => XEmitter<D, A, NI>;
	$descr: (args?: XArgs<A>) => D;
	$on: (listener: (xevt: XEvent<D, A, I>) => void) => XUnsubsribe;
	$filter: (fn: (data: XArgs<A>) => boolean) => Pick<this, '$on'>;
};

export type XGroupSpec = {
	[name:string]: XEmitter<any, any, any> | XGroup<any, any, any>;
};

export type XGroup<
	D extends string,
	G extends XGroupSpec,
	I extends XInit,
> = G & {
	$observed(): boolean;
	$use(extra?: WithXEventsBySpec<G, true>): WithXEventsBySpec<G, false>;
	$keys: () => (keyof G)[]
	$descr: () => D;
	$clone: <NI extends XInit = I>(init?: NI) => XGroup<D, G, NI>;
	$path: () => string[];
	$on: (listener: (xevt: XGroupEvent<G>) => void) => XUnsubsribe;
	$group: () => XGroup<string, XGroupSpec, XInit> | undefined;
};

export type Cast<A, B> = A extends B ? A : B;

export type XGroupEvent<G extends XGroupSpec> = Cast<{
	[K in keyof G]: G[K] extends XEmitter<infer D, infer A, infer I>
		? XEvent<D, A, I>
		: XGroupEvent<G[K]>
	;
}[keyof G], XEvent<string, any, any>>;

export type WithXEvents<G> = G extends XGroup<any, infer S, any>
	? WithXEventsBySpec<S, true>
	: never
;

export type WithXEventsBySpec<S extends XGroupSpec, OPT extends boolean> = (
	OPT extends true ? {
		readonly [K in keyof S]?: S[K] extends XEmitter<any, infer A, any>
			? (data: XArgs<A>) => void
			: WithXEventsBySpec<S[K], OPT>
		;
	}
	: {
		readonly [K in keyof S]: S[K] extends XEmitter<any, infer A, any>
			? (data: XArgs<A>) => void
			: WithXEventsBySpec<S[K], OPT>
		;
	}
);
