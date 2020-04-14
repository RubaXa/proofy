import { XGroup, XGroupSpec, XInit, XEvent } from '../typing';
import { defineGetters } from '../utils';
import { isXGroup } from '../xgroup/xgroup';

const featuresRegistry = {} as {[id: string]: Feature<any>};
const experimentsRegistry = {} as {
	[id: string]: {
		feature: Feature<string>;
		description: ExperimentDescription;
	};
};
const experimentsObservers = [] as ExperimentsObserver[];
const featureChangeObservers = [] as FeatureChangeObserver[];

export type ExperimentsObserver = (feature: Feature<string>, xevt: XEvent<string, any, any>) => void;
export type FeatureChangeObserver = (feature: Feature<string>) => void;

export type FeatureDescription<
	ID extends string,
> = {
	id: ID;
	name: string;
	events: XGroup<string, XGroupSpec, XInit>;
}

export type Feature<
	ID extends string,
> = Readonly<(
	& FeatureDescription<ID>
	& ExperimentDescription
)>;

export type ExperimentDescription = {
	split: string | null;
	active: boolean;
	enabled: boolean;
	released: boolean;
};

export function createFeature<
	ID extends string,
>(
	descr: FeatureDescription<ID>,
): Feature<ID> {
	if (featuresRegistry[descr.id] !== void 0) {
		console.warn(new Error(`Feature "${descr.id}" already registred`));
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
	notifyFeatureChangeObservers(feature);

	return feature;
}

export function setupExperiment(
	feature: Feature<string>,
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

export function getFeature<ID extends string>(id: ID): Feature<ID> | null {
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

export function addFeatureChangeObserver(fn: FeatureChangeObserver) {
	featureChangeObservers.push(fn);

	return () => {
		const idx = featureChangeObservers.indexOf(fn);
		(idx !== -1) && featureChangeObservers.splice(idx, 1);
	};
}

function notifyExperimentsObservers(feature: Feature<string>, xevt: XEvent<string, any, any>) {
	let idx = experimentsObservers.length;
	while (idx--) {
		experimentsObservers[idx](feature, xevt);
	}
}

function notifyFeatureChangeObservers(feature: Feature<string>) {
	let idx = featureChangeObservers.length;
	while (idx--) {
		featureChangeObservers[idx](feature);
	}
}

function getFeatureState<K extends keyof ExperimentDescription>(
	descr: FeatureDescription<string>,
	key: K,
): ExperimentDescription[K] | null {
	const item = experimentsRegistry[descr.id];
	return item === void 0 ? null : item.description[key];
}
