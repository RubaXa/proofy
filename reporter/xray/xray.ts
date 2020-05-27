import { addFeatureChangeObserver } from '../../src/feature/feature';
import { createConsoleReporter } from '../console';
import { ExperimentsObserver } from '../../src/feature/feature.typings';

export type LikeXRay = {
	send: (t: string, i: {[key:string]: string}) => void;
	addSplit: (v: string) => void;
}

export type XRayReporterInit = {
	send: LikeXRay['send'];
	prepare?: (val: string) => string;
	glue?: string;
	verbose?: boolean;
}

export function createXRayReporter(init: XRayReporterInit): ExperimentsObserver {
	const {
		send,
		glue = '_',
		prepare = defaultPrepare,
		verbose,
	} = init;
	const log = verbose ? createConsoleReporter() : null as (ExperimentsObserver | null);

	return (feature, xevt) => {
		const chain = [feature.id].concat(xevt.target.$path());
		const metrics = {};

		createIntervals(metrics, xevt.data, glue),

		(log !== null) && log(feature, xevt);
		send(chain.map(prepare).join(glue), metrics);
	};
}

export function xraySplitAutoConfiguration(xray: LikeXRay) {
	return addFeatureChangeObserver((feature) => {
		if (feature.enabled && feature.split) {
			xray.addSplit(`s${feature.split}s`);
		} else {
			// todo: removeSplit???
		}
	});
}

const R_CAMEL = /([A-Z]+\w)/g;
const R_LIKE_CALLBACK = /^on([A-Z])/;

function defaultPrepare(val: string) {
	return val
		.replace(R_LIKE_CALLBACK, '$1')
		.replace(R_CAMEL, toKebabCase)
	;
}

function toKebabCase(_: string, match: string, offset: number) {
	return (offset ? '-' : '') + match.toLowerCase();
}

function createIntervals(metrics: object, data: object, glue: string): void {
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			const val = data[key];

			if (typeof val === 'string') {
				metrics[key + glue + val] = 1;
			} else {
				metrics[key] = +val >= 0 ? +val : 1;
			}
		}
	}
}
