import { createXEmitter } from './src/xemitter/xemitter';
import { createXGroup } from './src/xgroup/xgroup';
import { defineStaticProperies } from './src/utils';

export * from './src/typing';

export const xevent = defineStaticProperies(createXEmitter, {
	group: createXGroup,
});

export {
	createXEmitter,
	createXGroup,
};
