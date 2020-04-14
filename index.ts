import {
	createXEmitter,
	createXType,
	createXEnum,
} from './src/xemitter/xemitter';
import { createXGroup } from './src/xgroup/xgroup';
import { defineStaticProperies } from './src/utils';

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
