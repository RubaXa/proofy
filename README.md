proofy
------
A set of tools for creating and conducting experiments.

```sh
npm i --save proofy
```

---

### Features

- Easy and Flexibility API 🧬
- Supported IFrames (regardless of nesting) 💪🏻
- Runtime logger & verbose mode ✴️
- Fully testelably ✅

---

### 1. Describe xevents

```ts
import { xevent } from 'proofy';

export const appXEvents = xevent.group('App events', {
	// Некий набор DOM событий
	dom: xevent.group('DOM', {
		ready: xevent('Ready', {}), // "Ready" — описание события
		unload: xevent('Page unload', {}),
	}),

	// События авторизации
	auth: xevent.group('Авторизация', {
		try: xevent(
			'Попытка авторизации с шага "{data.step}" по "{data.type}" через "{data.type}"',
			{
				step: {
					name: 'Шаг',
					type: ['login', 'passwd', 'f-restore', ...], // enum
				},
				type: {
					name: 'Тип',
					type: ['password', 'qr', 'webauthn', ...]
				},
				method: {
					name: 'Метод отправки формы',
					type: ['submit', 'redirect']
				},
			},
		),
	}),

	// Клик по кнопке, ссылки и т.п.
	click: xevent(
		'Клик по "{data.elem}"',
		{
			elem: {
				name: 'Элемент',
				type: ['signup', 'login', 'qrlink'],
			},
		},
	),
});

// Дальше, где-то в коде используем их.
document.addEventListener('DOMContentLoaded', () => {
	appXEvents.dom.ready(); // ['dom', 'ready']
});

// Или упрощенная запись
appXEvents.dom.ready.$bind(document, 'DOMContentLoaded');
appXEvents.dom.unload.$bind(window, 'unload');
```

---


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
