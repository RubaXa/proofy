import { createXEmitter } from './xemitter';

describe('xevent', () => {
	const domReady = createXEmitter('DOM Ready at {data.time}', {
		time: {
			name: 'Time',
			type: Number,
		},
	});

	it('$descr', () => {
		const ts = Date.now();

		expect(domReady.$descr()).toBe('DOM Ready at {data.time}');
		expect(domReady.$descr({time: ts})).toBe(`DOM Ready at ${ts}`);
	});

	it('$on', () => {
		const log = [] as number[];
		const off = domReady.$on(({data}) => {
			log.push(data.time);
		});

		domReady({time: 1});
		domReady({time: 2});
		off();
		domReady({time: 3});

		expect(log).toEqual([1, 2]);
	});
});
