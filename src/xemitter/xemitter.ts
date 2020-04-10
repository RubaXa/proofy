import {
	XEmitter,
	XArgsSpec,
	XArgs,
	XInit,
	XEvent,
	XArgSpec,
	XType,
	XTypeEnumValues,
	XDescrArgs,
	XUnsubsribe,
	XArgEnumSpec,
} from '../typing';
import { defineStaticProperies } from '../utils';

export function createXEmitter<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
>(
	descr: D | ((args: XDescrArgs<A>) => D),
	args: A,
	init?: I,
): XEmitter<D, A, I> {
	const listeners = [] as ((xevt: XEvent<D, A, I>) => void)[];
	const path = init ? init.group.$path().concat(init.name) : [] as string[];
	const argKeys = Object.keys(args);
	let locked = false;

	function emit(data: XArgs<A>) {
		if (locked) {
			return;
		}

		locked = true;

		let idx = listeners.length;
		let xevt = {
			ts: Date.now(),
			target: emit as XEmitter<D, A, I>,
			data,
		};

		while (idx--) {
			listeners[idx](xevt);
		}

		locked = false;
	}

	function $args() {
		return args;
	}
	
	function $path() {
		return path;
	}

	function $on(listener: (xevt: XEvent<D, A, I>) => void): XUnsubsribe {
		listeners.push(listener);

		return () => {
			const idx = listeners.indexOf(listener);
			(idx > -1) && listeners.splice(idx, 1);
		};
	}

	function $clone<NI extends XInit = I>(ninit?: NI) {
		return createXEmitter(descr, args, (ninit || init) as NI);
	}

	function $descr(data?: XArgs<A>): D {
		if (typeof descr === 'string') {
			return descr;
		}

		if (data == null) {
			return descr(newProxyArgs(args));
		}

		return descr(argKeys.reduce((map, key) => {
			const arg = args[key];

			map[key] = {
				name: ('values' in arg) ? arg.values[data[key]] : arg.name,
				value: data[key],
			};
			return map;
		}, {}) as XDescrArgs<A>);
	}

	function $filter(fn: (args: XArgs<A>) => boolean) {
		return {
			$on: (listener: (xevt: XEvent<D, A, I>) => void) => {
				return $on((xevt) => {
					fn(xevt.data) && listener(xevt);
				});
			},
		};
	}

	return defineStaticProperies(emit, {
		$args,
		$clone,
		$path,
		$on,
		$descr,
		$filter,
	});
}

export function createXType<
	N extends string,
	T extends XType,
>(name: N, type: T): XArgSpec<N, T> {
	return <const>{ name, type };
}

export function createXEnum<
	N extends string,
	E extends XTypeEnumValues,
>(name: N, values: E): XArgEnumSpec<N, E> {
	return <const>{ name, values };
}

function newProxyArgs<A extends XArgsSpec>(args: A) {
	return new Proxy({}, {
		get(_, prop) {
			return {
				name: `\${${prop as string}.name}`,
				value: `\${${prop as string}.value}`,
			};
		},
	}) as XDescrArgs<A>;
}
