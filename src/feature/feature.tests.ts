import { createXGroup } from '../xgroup/xgroup';
import { createXEmitter } from '../xemitter/xemitter';
import { createFeature, setupExperiment } from './feature';

describe('xfeature', () => {
	const dom = createXGroup('DOM Events', {
		ready: createXEmitter('Ready', {}),
	});

	describe('create', () => {
		const feature = createFeature({
			id: 'test',
			name: 'Test feature',
			events: dom,
		});

		it('initial', () => {
			expect(feature.id).toEqual('test');
			expect(feature.name).toEqual('Test feature');
			expect(feature.active).toEqual(false);
			expect(feature.enabled).toEqual(false);
			expect(feature.released).toEqual(false);
		});

		describe('setup', () => {
			it('not active', () => {
				setupExperiment(feature, {
					active: true,
				});

				expect(feature.active).toEqual(false);
				expect(feature.enabled).toEqual(false);
			});

			it('active', () => {
				setupExperiment(feature, {
					active: true,
					enabled: true,
				});

				expect(feature.active).toEqual(true);
				expect(feature.enabled).toEqual(true);
			});
		});
	});
});
