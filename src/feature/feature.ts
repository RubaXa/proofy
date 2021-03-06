import { XEvent, XGroup, XGroupSpec, XInit } from '../typing';
import { defineGetters } from '../utils';
import { isXGroup } from '../xgroup/xgroup';
import { Feature, ExperimentDescription, ExperimentsObserver, FeatureDescription, FeatureChangeObserver } from './feature.typings';
import { createConsoleReporter } from '../../reporter/console';

const featuresRegistry = {} as {[id: string]: Feature<any, any>};
const experimentsRegistry = {} as {
	[id: string]: {
		feature: Feature<string, XGroup<string, XGroupSpec, XInit>>;
		description: ExperimentDescription;
	};
};
const experimentsObservers = [] as ExperimentsObserver[];
const featureChangeObservers = [] as FeatureChangeObserver[];

export function createFeature<
	ID extends string,
	XG extends XGroup<string, XGroupSpec, XInit>,
>(
	descr: FeatureDescription<ID, XG>,
): Feature<ID, XG> {
	const existsEeature = featuresRegistry[descr.id];

	if (existsEeature !== void 0) {
		Object.assign(existsEeature, descr);
		return existsEeature;
	}

	if (isXGroup(descr.events)) {
		descr.events.$on((xevt) => {
			notifyExperimentsObservers(feature, xevt);
		});
	}

	const feature = defineGetters({...descr}, {
		split() {
			return getFeatureState(feature, 'split');
		},

		active() {
			return this.enabled && !!getFeatureState(feature, 'active');
		},

		enabled() {
			return !!getFeatureState(feature, 'enabled');
		},

		released() {
			return !!getFeatureState(feature, 'released');
		},
	});

	featuresRegistry[feature.id] = feature;
	if (experimentsRegistry[feature.id] !== void 0) {
		experimentsRegistry[feature.id].feature = feature;
	}

	notifyFeatureChangeObservers(feature);

	return feature;
}

export function setupExperiment(
	feature: Feature<string, any>,
	description: Partial<ExperimentDescription>,
) {
	if (experimentsRegistry[feature.id] === void 0) {
		experimentsRegistry[feature.id] = {
			feature,
			description: {
				split: null,
				active: false,
				enabled: false,
				released: false,
				...description,
			},
		};
	} else {
		Object.assign(experimentsRegistry[feature.id].description, description);
	}

	notifyFeatureChangeObservers(feature);
}

export function getFeature<ID extends string>(id: ID): Feature<ID, any> | null {
	return featuresRegistry[id] === void 0 ? null : featuresRegistry[id];
}

export function getAllFeatures() {
	return Object.values(featuresRegistry);
}

export function getAllExperiment() {
	return Object.values(experimentsRegistry);
}

export function addExperimentsObserver(fn: ExperimentsObserver) {
	experimentsObservers.push(fn);
	return () => {
		const idx = experimentsObservers.indexOf(fn);
		(idx !== -1) && experimentsObservers.splice(idx, 1);
	};
}

const _verboseReporter = createConsoleReporter();
let _verboseExperimentsUnobserve = null as (null | (() => void))

export type VerboseFilter = (
	feature: Feature<string, any>,
	xevt: XEvent<string, any, any>,
) => boolean;

export function verboseExperiments(state?: boolean | VerboseFilter) {
	_verboseExperimentsUnobserve && _verboseExperimentsUnobserve();
	_verboseExperimentsUnobserve = null;
	
	if (state === true) {
		_verboseExperimentsUnobserve = addExperimentsObserver(_verboseReporter);
	} else if (typeof state === 'function') {
		_verboseExperimentsUnobserve = addExperimentsObserver((f, e) => {
			state(f, e) && _verboseReporter(f, e);
		});
	}
}

export function addFeatureChangeObserver(fn: FeatureChangeObserver) {
	featureChangeObservers.push(fn);

	return () => {
		const idx = featureChangeObservers.indexOf(fn);
		(idx !== -1) && featureChangeObservers.splice(idx, 1);
	};
}

function notifyExperimentsObservers(feature: Feature<string, any>, xevt: XEvent<string, any, any>) {
	let idx = experimentsObservers.length;
	while (idx--) {
		experimentsObservers[idx](feature, xevt);
	}
}

function notifyFeatureChangeObservers(feature: Feature<string, any>) {
	let idx = featureChangeObservers.length;
	while (idx--) {
		featureChangeObservers[idx](feature);
	}
}

function getFeatureState<K extends keyof ExperimentDescription>(
	descr: FeatureDescription<string, any>,
	key: K,
): ExperimentDescription[K] | null {
	const item = experimentsRegistry[descr.id];
	return item === void 0 ? null : item.description[key];
}
