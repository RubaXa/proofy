import { XGroup, XGroupSpec, XInit, XEvent } from '../typing';

export type ExperimentsObserver = (feature: Feature<string, any>, xevt: XEvent<string, any, any>) => void;
export type FeatureChangeObserver = (feature: Feature<string, any>) => void;

export type FeatureDescription<
	ID extends string,
	XG extends XGroup<string, XGroupSpec, XInit>,
> = {
	id: ID;
	name: string;
	events: XG;
}

export type Feature<
	ID extends string,
	XG extends XGroup<string, XGroupSpec, XInit>,
> = Readonly<(
	& FeatureDescription<ID, XG>
	& ExperimentDescription
)>;

export type ExperimentDescription = {
	split: string | null;
	active: boolean;
	enabled: boolean;
	released: boolean;
};
