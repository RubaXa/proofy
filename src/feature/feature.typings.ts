import { XGroup, XGroupSpec, XInit, XEvent } from '../typing';

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
