import { getAllExperiment } from '../feature/feature';
import { XGroup, XGroupSpec, XInit, XArgsSpec } from '../typing';
import { isXGroup } from '../xgroup/xgroup';
import { isXEmitter } from '../xemitter/xemitter';

export function exportExperiments() {
	return getAllExperiment().map(({feature}) => ({
		id: feature.id,
		feature: {...feature},
		events: exportXGroup(feature.events),
	}));
}

export type XGroupExport = {
	name: string | undefined;
	path: string[];
	description: string;
	type: 'group';
	nested: {
		[key:string]: XGroupExport | XEventExport;
	};
};

export type XEventExport = {
	args: XArgsSpec;
	name: string | undefined;
	path: string[];
	description: string;
	type: 'event';
};

export function exportXGroup(group: XGroup<string, XGroupSpec, XInit>) {
	const item: XGroupExport = {
		name: group.$name(),
		path: group.$path(),
		description: group.$descr(),
		type: 'group',
		nested: Object.entries(group).reduce((nested, [key, item]) => {
			if (isXGroup(item)) {
				nested[key] = exportXGroup(item);
			} else if (isXEmitter(item)) {
				nested[key] = {
					name: item.$name(),
					path: item.$path(),
					args: item.$args(),
					description: item.$descr(),
					type: 'event',
				};
			}

			return nested;
		}, {} as XGroupExport['nested']),
	};

	return item;
}
