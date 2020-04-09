
export function defineProperies<
	T extends object,
	P extends PropertyDescriptorMap,
>(obj: T, props: P) {
	Object.defineProperties(obj, props);
	return obj as (T & {
		[K in keyof P]: P[K]['get'] extends unknown
			? ReturnType<NonNullable<P[K]['get']>>
			: P[K]['value']
		;
	});
}

export function defineStaticProperies<
	T extends object,
	P extends {[key:string]: any},
>(obj: T, props: P) {
	Object.defineProperties(obj, Object.keys(props).reduce((map, key) => {
		map[key] = {
			value: props[key],
			enumerable: false,
			writable: false,
			configurable: false,
		};
		return map;
	}, {} as PropertyDescriptorMap));
	return obj as (T & P);
}
