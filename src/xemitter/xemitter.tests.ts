import { createXEmitter, createXType, createXEnum } from './xemitter';
import { createXGroup } from '../xgroup/xgroup';
import { WithXEvents } from '../typing';

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

describe('xconnect', () => {
	const appXEvents = createXGroup('App events', {
		clickBy: createXEmitter(({el}) => `Click by "${el.name}"`, {
			el: createXEnum('Element', {
				'link': 'Link',
				'btn': 'Button',
			}),
		}),

		auth: createXGroup('Auth events', {
			try: createXEmitter('Try auth', {}),
		}),
	});

	type AppProps = {
		xevents?: WithXEvents<typeof appXEvents>;
	};

	const App = function (props: AppProps) {
		const xevents = appXEvents.$use(props.xevents);
		xevents.clickBy({el: 'btn'});
		xevents.auth.try({});
	};

	it('without extra', () => {
		const log = [] as any[];
		const off = appXEvents.$on(({target, data}) => {
			log.push(target.$path().concat(data as any));
		});

		App({});
		off();
		expect(log).toEqual([['clickBy', {el: 'btn'}], ['auth', 'try', {}]]);
	});
	
	it('with extra', () => {
		const log = [] as any[];
		const off = appXEvents.$on(({target, data}) => {
			log.push(target.$path().concat(data as any));
		});

		App({
			xevents: {
				clickBy: () => {
					log.push('over-click');
				},
			}
		});
		off();
		expect(log).toEqual([['clickBy', {el: 'btn'}], 'over-click', ['auth', 'try', {}]]);
	});
});
