import { createXEmitter, createXType } from '../xemitter/xemitter';
import { createXGroup } from './xgroup';

describe('xgroup', () => {
	const dom = createXGroup('DOM Events', {
		ready: createXEmitter('Ready', {
			foo: createXType('Foo', String),
		}),
		unload: createXEmitter('Unload', {
			bar: createXType('Bar', Boolean),
		}),
	});
	const app = createXGroup('App Events', {
		dom,
	});

	describe('dom', () => {
		it('$descr', () => {
			expect(dom.$descr()).toBe('DOM Events');
		});
		
		it('$path', () => {
			expect(dom.$path()).toEqual([]);
			expect(dom.ready.$path()).toEqual(['ready']);
		});
	});

	describe('app', () => {
		it('$path', () => {
			expect(app.dom.$path()).toEqual(['dom']);
			expect(app.dom.ready.$path()).toEqual(['dom', 'ready']);
		});

		it('$on', () => {
			const log = [] as any[];
			const off = app.$on((xevt) => {
				if ('foo' in xevt.data) {
					log.push(xevt.data.foo, xevt.target.$path());
				} else {
					log.push(xevt.data.bar);
				}
			});

			app.dom.ready({foo: 'ok'});
			app.dom.unload({bar: true});
			off();
			app.dom.ready({foo: 'fail'});

			expect(log).toEqual(['ok', ['dom', 'ready'], true]);
		});
	});
});
