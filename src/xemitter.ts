import {
	XEmitter,
	XArgsSpec,
	XArgs,
	XInit,
	XEvent,
} from './typing';
import { defineStaticProperies } from './utils';

export function createXEmitter<
	D extends string,
	A extends XArgsSpec,
	I extends XInit,
>(
	descr: D,
	args: A,
	init?: I,
): XEmitter<D, A, I> {
	const listeners = [] as ((xevt: XEvent<D, A, I>) => void)[];
	const descrFn = compileDescr(args, descr);
	const path = init ? init.group.$path().concat(init.name) : [] as string[];
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

	function $isEvent(xevt: XEvent<any, any, any>): xevt is XEvent<D, A, I> {
		return (xevt.target.$args() === args);
	}

	function $on(listener: (xevt: XEvent<D, A, I>) => void) {
		listeners.push(listener);

		return () => {
			const idx = listeners.indexOf(listener);
			(idx > -1) && listeners.splice(idx, 1);

			return descr;
		};
	}

	function $clone<NI extends XInit = I>(ninit?: NI) {
		return createXEmitter(descr, args, (ninit || init) as NI);
	}

	function $descr(args?: XArgs<A>) {
		if (args == null) {
			return descr;
		}

		return descrFn(args);
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
		$isEvent,
		$clone,
		$path,
		$on,
		$descr,
		$filter,
	});
}

const R_EXPR = /{(.*?)}/g;

function compileDescr<A extends XArgsSpec>(args: A, descr: string) {
	// todo: validation by args
	try {
		const source = descr
			.split(R_EXPR)
			.map((v, i) => i % 2 ? v : JSON.stringify(v))
			.join(' + ')
		;
		return Function(`data`, `return (${source});`);
	} catch (err) {
		console.warn(err);
		return () => err.toString();
	}
}
