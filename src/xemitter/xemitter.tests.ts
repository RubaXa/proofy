import { createXEmitter, createXType, createXEnum } from './xemitter';

describe('xevent', () => {
	const domReady = createXEmitter(({time}) => `DOM Ready at ${time.value} (${time.name})`, {
		time: createXType('Time', Number),
	});
	const simpleEvent = createXEmitter(`Simple event`, {});

	it('$descr', () => {
		const ts = Date.now();

		expect(domReady.$descr()).toBe('DOM Ready at ${time.value} (${time.name})');
		expect(domReady.$descr({time: ts})).toBe(`DOM Ready at ${ts} (Time)`);
		expect(simpleEvent.$descr()).toBe(`Simple event`);
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
	
	it('$filter', () => {
		const log = [] as number[];
		const off = domReady.$filter(({time}) => time === 456).$on(({data}) => {
			log.push(data.time);
		});

		domReady({time: 123});
		domReady({time: 456});
		off();
		domReady({time: 789});

		expect(log).toEqual([456]);
	});

	describe('Enum type', () => {
		const clickEvent = createXEmitter(({elem}) => `Клик по "${elem.name}" (${elem.value})`, {
			elem: createXEnum('Элемент', {
				'link': 'Ссылка',
				'btn': 'Кнопка',
			}),
		});

		it('$descr', () => {
			const ts = Date.now();
	
			expect(clickEvent.$descr()).toBe('Клик по "${elem.name}" (${elem.value})');
			expect(clickEvent.$descr({elem: 'link'})).toBe(`Клик по "Ссылка" (link)`);
		});
	});
});
