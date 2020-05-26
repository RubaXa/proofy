import {
	createXEmitter,
	createXType,
	createXEnum,
} from './src/xemitter/xemitter';
import { createXGroup } from './src/xgroup/xgroup';
import { defineStaticProperies } from './src/utils';
import {
	verboseExperiments,
	setupExperiment,
	createFeature,
} from './src/feature/feature';
import { ExperimentDescription } from './src/feature/feature.typings';

export * from './src/feature/feature';
export * from './src/typing';

export const xevent = defineStaticProperies(createXEmitter, {
	group: createXGroup,
	type: createXType,
	enum: createXEnum,
});

export {
	createXEmitter as createXEvent,
	createXGroup,
	createXType,
	createXEnum,
};

export const proofy = {
	xevent,
	createFeature,
	setupExperiment,
	verboseExperiments,
};

try {
	(function (globalThis) {
		const exportKey = '__proofy__';
		const preventExportKey = '__proofy:prevent:global:export__';
	
		if (preventExportKey in globalThis) {
			return;
		}
	
		if (exportKey in globalThis) {
			try {
				const initial = globalThis[exportKey] as {
					[id:string]: Partial<ExperimentDescription>;
				};
				Object.keys(initial).forEach((id) => {
					setupExperiment({id} as any, initial[id]);
				});
	
				delete globalThis[exportKey];
			} catch (err) {
				console.warn('[proofy] Inline configuration failed:', err);
			}
		}
	
		Object.defineProperty(globalThis, exportKey, {
			value: proofy,
			enumerable: false,
			writable: false,
			configurable: false,
		});
	})(0
		|| typeof globalThis === 'object' && globalThis 
		|| typeof window === 'object' && window
		|| typeof global === 'object' && global
		|| {}
	);
} catch (_) {}
