import {
	XGroup,
	XGroupSpec,
	XInit,
	XGroupEvent,
	XUnsubsribe,
} from '../typing';
import { defineStaticProperies } from '../utils';

export function createXGroup<
	D extends string,
	G extends XGroupSpec,
	I extends XInit,
>(
	descr: D,
	spec: G,
	init?: I,
): XGroup<D, G, I> {
	const keys = Object.keys(spec);
	const path = init ? init.group.$path().concat(init.name) : [] as string[];
	const group = defineStaticProperies({}, <XGroup<D, G, I>>{
		$descr: () => descr,

		$clone: <NI extends XInit = I>(ninit?: NI) => {
			return createXGroup(descr, spec, (ninit || init) as NI)
		},

		$path: () => path,

		$on: (listener: (xevt: XGroupEvent<G>) => void): XUnsubsribe => {
			const list = [] as XUnsubsribe[];
			
			keys.forEach(key => {
				list.push(group[key].$on(listener));
			});

			return () => {
				list.forEach(callUnsubsribe);
			};
		},
	});
	
	return keys.reduce((group, name) => {
		Object.defineProperty(group, name, {
			value: spec[name].$clone({
				name,
				group,
			}),
			enumerable: true,
			configurable: false,
			writable: false,
		});

		return group;
	}, group);
}


function callUnsubsribe(fn: XUnsubsribe) {
	fn();
}
