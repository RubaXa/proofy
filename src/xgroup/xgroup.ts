import {
	XGroup,
	XGroupSpec,
	XInit,
	XGroupEvent,
	XUnsubsribe,
	WithXEventsBySpec,
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
	let listeners = 0;
	const keys = Object.keys(spec);
	const path = init ? init.group.$path().concat(init.name) : [] as string[];
	const group = defineStaticProperies({} as XGroup<D, G, I>, {
		$use: (xevents?: WithXEventsBySpec<G, true>) => {
			return overrideXEvents(group, xevents);
		},

		$observed: () => (listeners > 0) && (!init || init.group.$observed()),

		$keys: () => keys,

		$descr: () => descr,

		$clone: <NI extends XInit = I>(ninit?: NI) => {
			return createXGroup(descr, spec, (ninit || init) as NI)
		},

		$path: () => path,
		$group: () => init?.group,

		$on: (listener: (xevt: XGroupEvent<G>) => void): XUnsubsribe => {
			const list = [] as XUnsubsribe[];
			
			listeners++;
			keys.forEach(key => {
				list.push(group[key].$on(listener));
			});

			return () => {
				listeners--;
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

function overrideXEvents(group: XGroup<any, any, any>, xevents?: WithXEventsBySpec<any, true>) {
	if (xevents == null) {
		return group;
	}

	return group.$keys().reduce((xover, key: string) => {
		const orig = group[key];
		const extra = xevents[key];

		if (extra === void 0) {
			xover[key] = orig;
		} else if (orig.$keys !== void 0) {
			xover[key] = overrideXEvents(group[key], extra as any);
		} else {
			xover[key] = function (data: object) {
				orig(data);
				try {
					(extra as any).call(data);
				} catch (err) {
					console.error(err);
				}
			};
		}

		return xover;
	}, {});
}


export function isXGroup(val: any): val is XGroup<string, XGroupSpec, XInit> {
	return val ? typeof val.$observed === 'function' : false;
}
