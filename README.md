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
		onTry: xevent(
			({step, type, method}) => `Попытка авторизации с шага "${step.name}" по "${type.name}" через "${method.name}"`,
			{
				step: xevent.enum('Шаг', {
					'login': 'Ввод Логина',
					'passwd': 'Ввод пароля',
					'f-restore': 'Быстрый Вход',
				}),
				type: xevent.enum('Тип', {
					'password': 'Пароль',
					'qr': 'QR',
					'webauthn': 'WebAuthn',
				}),
				method: xevent.enum('Метод отправки формы', {
					'submit': 'Отправка Формы',
					'redirect': 'JS Редирект',
				}),
			},
		),

		// Клик по кнопке, ссылки и т.п.
		onClick: xevent(
			({elem}) => `Клик по "${elem.name}"`,
			{
				elem: xevent.enum('Элемент', {
					'signup': 'Регистрация',
					'login': 'Вход'
					'qrlink': 'QR',
				}),
			},
		),
	}),
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

### Соединяем с React

```tsx
export type AuthFormProps = WithXEvents<typeof appXEvents.auth> & {
};

export const AuthForm = xevent.connect([appXEvents.auth], function (props: AuthFormProps) {

})
```

---


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
