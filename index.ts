import { createXEmitter } from './src/xemitter';
import { createXGroup } from './src/xgroup';
import { defineStaticProperies } from './src/utils';

export * from './src/typing';

export const xevent = defineStaticProperies(createXEmitter, {
	group: createXGroup,
});

export {
	createXEmitter,
	createXGroup,
};
