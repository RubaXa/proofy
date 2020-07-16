import { createXRayReporter } from './xray';
import { addExperimentsObserver, createFeature, setupExperiment } from '../../src/feature/feature';
import { createXGroup } from '../../src/xgroup/xgroup';
import { createXEmitter, createXType } from '../../src/xemitter/xemitter';

it('xray', () => {
	const qr = createXGroup('QRAuth events', {
		onAuth: createXEmitter('Auth event', {
			token: createXType('Token', String),
		}),
	});
	const log = [] as any[];
	const reporter = createXRayReporter({
		send: (t, i) => log.push(t, i),
	});
	const feature = createFeature({
		id: 'qrauth',
		name: 'QR Auth',
		events: qr,
	});

	setupExperiment(feature, {enabled: true});
	afterEach(addExperimentsObserver(reporter));

	qr.onAuth({token: 'foo-bar'});
	expect(log).toEqual(['qrauth_auth', {i:{'token_foo-bar': 1}}]);
});
